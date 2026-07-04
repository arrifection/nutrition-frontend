import logging
import os
import traceback

from fastapi import APIRouter, HTTPException, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, timedelta

from database import users_collection, user_helper
from db_ready import ensure_db_ready, is_db_connection_error, raise_db_unavailable
from auth_utils import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    generate_verification_token,
    hash_token,
)
from email_utils import send_verification_email
from password_policy import validate_password_strength
from login_throttle import check_login_allowed, record_failed_login, clear_failed_logins
from refresh_token_service import (
    REFRESH_COOKIE_NAME,
    REFRESH_COOKIE_PATH,
    issue_token_pair,
    rotate_refresh_token,
    revoke_refresh_token,
)
from bson import ObjectId
from pymongo.errors import AutoReconnect, ConfigurationError, NetworkTimeout, ServerSelectionTimeoutError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

ENABLE_DEV_AUTH = os.getenv("ENABLE_DEV_AUTH", "false").lower() in {"1", "true", "yes"}
IS_PRODUCTION = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower() in {"production", "prod"}


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "dietitian"

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        validate_password_strength(v)
        return v

    @field_validator("username")
    @classmethod
    def username_trim(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Username must be at least 2 characters.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RequestVerificationEmail(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class Token(BaseModel):
    access_token: str
    refresh_token: str | None = None
    expires_in: int
    token_type: str
    username: str
    email: str
    role: str


def _is_db_connection_error(error: Exception) -> bool:
    return is_db_connection_error(error)


def _raise_db_unavailable() -> None:
    raise_db_unavailable()


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="lax",
        max_age=7 * 24 * 3600,
        path=REFRESH_COOKIE_PATH,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)


async def _issue_verification_email(email: str) -> dict:
    new_token = generate_verification_token()
    new_deadline = datetime.utcnow() + timedelta(days=2)
    token_hash = hash_token(new_token)

    update_result = await users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "verification_token_hash": token_hash,
                "verification_deadline": new_deadline,
            }
        },
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User record not found")

    email_result = await send_verification_email(email, new_token)
    if not email_result.success:
        logger.error("[AUTH EMAIL] Failed to send verification to %s: %s", email, email_result.error_message)
        raise HTTPException(
            status_code=503,
            detail="We couldn't send the verification email right now. Please try again in a few minutes.",
        )

    return {
        "message": "Verification email sent. You have 2 days to verify your account, then you can sign in.",
        "email_sent": True,
        "verification_deadline": new_deadline,
    }


async def get_current_user(token: str | None = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user_helper(user)


@router.post("/register", response_model=dict)
async def register(user_data: UserRegister, request: Request):
    await ensure_db_ready()
    try:
        user_data.email = user_data.email.lower()

        existing_email = await users_collection.find_one({"email": user_data.email})
        if existing_email:
            logger.info("[AUTH SIGNUP] Blocked duplicate email for %s", user_data.email)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already registered. Sign in instead, or use Resend Verification Email on the login page.",
            )

        existing_username = await users_collection.find_one({"username": user_data.username})
        if existing_username:
            logger.info("[AUTH SIGNUP] Blocked duplicate username for %s", user_data.username)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken. Choose a different username and try again.",
            )

        hashed_password = get_password_hash(user_data.password)
        verification_token = generate_verification_token()
        verification_deadline = datetime.utcnow() + timedelta(days=2)

        new_user = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "role": "dietitian",
            "createdAt": datetime.utcnow(),
            "email_verified": False,
            "verification_deadline": verification_deadline,
            "verification_token_hash": hash_token(verification_token),
            "failed_login_attempts": 0,
        }

        result = await users_collection.insert_one(new_user)
        if result.inserted_id:
            logger.info("[AUTH SIGNUP] User %s registered", user_data.email)
            email_result = await send_verification_email(user_data.email, verification_token)
            email_sent = email_result.success
            if not email_sent:
                logger.warning(
                    "[AUTH SIGNUP] Account created but verification email failed for %s: %s",
                    user_data.email,
                    email_result.error_message,
                )
            return {
                "message": "Account created. You can sign in now. Please verify your email within 2 days.",
                "email_sent": email_sent,
            }
        raise HTTPException(status_code=500, detail="Failed to register user record")
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as e:
        if _is_db_connection_error(e):
            _raise_db_unavailable()
        logger.error("[AUTH SIGNUP] Unexpected error for %s: %s", user_data.email, e)
        raise HTTPException(status_code=500, detail="We couldn't create your account right now. Please try again.")


@router.post("/login")
async def login(user_data: UserLogin, request: Request, response: Response):
    await ensure_db_ready()
    try:
        user_data.email = user_data.email.lower()
        await check_login_allowed(user_data.email)

        user = await users_collection.find_one({"email": user_data.email})
        if not user or not verify_password(user_data.password, user["password"]):
            await record_failed_login(user_data.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.get("email_verified", False):
            deadline = user.get("verification_deadline")
            if deadline and datetime.utcnow() > deadline:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your verification window has ended. Use Resend Verification Email on the login page to get a new link.",
                )

        await clear_failed_logins(user_data.email)

        if user.get("mfa_enabled"):
            temp_token = create_access_token(
                data={"sub": user["email"], "uid": str(user["_id"]), "mfa_pending": True},
                expires_delta=timedelta(minutes=5),
            )
            logger.info("[AUTH LOGIN] MFA challenge for %s", user_data.email)
            return {"mfa_required": True, "temp_token": temp_token}

        tokens = await issue_token_pair(user)
        _set_refresh_cookie(response, tokens["refresh_token"])

        logger.info("[AUTH LOGIN] Success for %s", user_data.email)
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "expires_in": tokens["expires_in"],
            "token_type": "bearer",
            "username": user["username"],
            "email": user["email"],
            "role": user.get("role", "client"),
        }
    except HTTPException:
        raise
    except Exception as e:
        if _is_db_connection_error(e):
            _raise_db_unavailable()
        logger.error("[AUTH LOGIN] Unexpected error for %s: %s", user_data.email, e)
        raise HTTPException(status_code=500, detail="We couldn't sign you in right now. Please try again.")


@router.post("/refresh", response_model=dict)
async def refresh_session(request: Request, response: Response, body: RefreshRequest | None = None):
    await ensure_db_ready()
    refresh_plain = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_plain and body and body.refresh_token:
        refresh_plain = body.refresh_token
    if not refresh_plain:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")

    tokens = await rotate_refresh_token(refresh_plain)
    _set_refresh_cookie(response, tokens["refresh_token"])
    return tokens


@router.post("/logout")
async def logout(request: Request, response: Response):
    refresh_plain = request.cookies.get(REFRESH_COOKIE_NAME)
    await revoke_refresh_token(refresh_plain)
    _clear_refresh_cookie(response)
    return {"message": "Signed out successfully"}


if ENABLE_DEV_AUTH:

    class EmailTest(BaseModel):
        email: EmailStr

    @router.post("/send-verification-to-existing-user", tags=["Development Only"])
    async def dev_send_verification(data: EmailTest):
        user = await users_collection.find_one({"email": data.email.lower()})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        token = generate_verification_token()
        deadline = datetime.utcnow() + timedelta(days=2)
        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "email_verified": False,
                    "verification_deadline": deadline,
                    "verification_token_hash": hash_token(token),
                }
            },
        )
        email_result = await send_verification_email(user["email"], token)
        if not email_result.success:
            raise HTTPException(status_code=503, detail=email_result.error_message or "Failed to send verification email")
        return {"message": f"Dev reset: email sent to {user['email']}"}

    @router.get("/dev-delete-user", tags=["Development Only"])
    async def dev_delete_user(email: str | None = None, username: str | None = None):
        if not email and not username:
            raise HTTPException(status_code=400, detail="Provide email or username query parameter")
        query = {"email": email.lower()} if email else {"username": username}
        result = await users_collection.delete_many(query)
        if result.deleted_count == 0:
            return {"message": "User not found", "query": query}
        return {"message": f"Deleted {result.deleted_count} record(s)"}


@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.get("/verify-email")
async def verify_email(token: str):
    try:
        token_hash = hash_token(token)
        user = await users_collection.find_one({
            "verification_token_hash": token_hash,
            "email_verified": False,
        })

        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired verification token")

        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"email_verified": True},
                "$unset": {"verification_token_hash": "", "verification_token_expires": ""},
            },
        )

        return {"message": "Email verified successfully! You can now use all features."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[VERIFY EMAIL] Error: %s", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/request-verification-email")
async def request_verification_email(data: RequestVerificationEmail, request: Request):
    await ensure_db_ready()
    data.email = data.email.lower()

    try:
        user = await users_collection.find_one({"email": data.email})
        if not user or not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

        if user.get("email_verified"):
            return {"message": "Your email is already verified. You can sign in now.", "email_sent": False}

        return await _issue_verification_email(data.email)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[REQUEST VERIFICATION] Error: %s\n%s", e, traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to send verification email")


@router.post("/resend-verification")
async def resend_verification(current_user: dict = Depends(get_current_user)):
    try:
        if current_user.get("email_verified"):
            return {"message": "Email is already verified"}

        if not current_user.get("email"):
            raise HTTPException(status_code=400, detail="User email not found")

        result = await _issue_verification_email(current_user["email"])
        return {"message": "Verification email resent. You have 2 more days to verify.", "email_sent": result["email_sent"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[RESEND VERIFICATION] Error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to resend verification email")
