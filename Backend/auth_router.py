from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from database import users_collection, user_helper
from auth_utils import get_password_hash, verify_password, create_access_token, decode_access_token, generate_verification_token, hash_token
from email_utils import send_verification_email
from bson import ObjectId
from pymongo.errors import AutoReconnect, ConfigurationError, NetworkTimeout, ServerSelectionTimeoutError

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "client" # Default to client, can be "dietitian"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    email: str
    role: str


def _is_db_connection_error(error: Exception) -> bool:
    return isinstance(error, (ServerSelectionTimeoutError, AutoReconnect, NetworkTimeout, ConfigurationError))


def _raise_db_unavailable():
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database is temporarily unreachable. Please try again in a moment.",
    )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
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
async def register(user_data: UserRegister):
    try:
        # Normalize email
        user_data.email = user_data.email.lower()
        
        # Check if user exists
        existing_user = await users_collection.find_one({
            "$or": [{"email": user_data.email}, {"username": user_data.username}]
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        hashed_password = get_password_hash(user_data.password)
        
        verification_token = generate_verification_token()
        verification_deadline = datetime.utcnow() + timedelta(days=2)
        
        new_user = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "role": user_data.role,
            "createdAt": datetime.utcnow(),
            "email_verified": False,
            "verification_deadline": verification_deadline,
            "verification_token_hash": hash_token(verification_token)
        }
        
        result = await users_collection.insert_one(new_user)
        if result.inserted_id:
            print(f"[DEBUG] Registered user: {user_data.email}")
            print(f"[DEBUG] Saved Token Hash: {new_user['verification_token_hash']}")
            print(f"SUCCESS: User {user_data.email} registered. Sending verification email...")
            await send_verification_email(user_data.email, verification_token)
            return {"message": "Account created. You can use Diet Desk now, but please verify your email within 2 days."}
        raise HTTPException(status_code=500, detail="Failed to register user record")
    except HTTPException as he:
        raise he
    except Exception as e:
        if _is_db_connection_error(e):
            print(f"DB ERROR in register: {type(e).__name__} - {e}")
            _raise_db_unavailable()
        print(f"ERROR in register: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {type(e).__name__} - {str(e)}")

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    try:
        # Normalize email
        user_data.email = user_data.email.lower()
        
        user = await users_collection.find_one({"email": user_data.email})
        if not user:
            print(f"LOGIN FAIL: User not found - {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not verify_password(user_data.password, user["password"]):
            print(f"LOGIN FAIL: Password mismatch for {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check email verification grace period
        if not user.get("email_verified", False):
            deadline = user.get("verification_deadline")
            if deadline and datetime.utcnow() > deadline:
                print(f"LOGIN BLOCK: {user_data.email} verification period expired")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your 2-day verification period has ended. Please verify your email to continue."
                )
        
        print(f"LOGIN SUCCESS: {user_data.email}")
        access_token = create_access_token(data={"sub": user["email"]})
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "username": user["username"],
            "email": user["email"],
            "role": user.get("role", "client")
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        if _is_db_connection_error(e):
            print(f"DB ERROR in login: {type(e).__name__} - {e}")
            _raise_db_unavailable()
        print(f"ERROR in login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {type(e).__name__} - {str(e)}")

# --- TEMPORARY DEV TESTING ENDPOINT ---
class EmailTest(BaseModel):
    email: EmailStr

@router.post("/send-verification-to-existing-user", tags=["Development Only"])
async def dev_send_verification(data: EmailTest):
    """
    TEMPORARY: Resets an existing user to unverified and sends an email.
    USE ONLY FOR TESTING.
    """
    try:
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
                    "verification_token_hash": hash_token(token)
                }
            }
        )
        
        await send_verification_email(user["email"], token)
        return {"message": f"Dev Reset Success: Email sent to {user['email']}. User is now unverified with a 2-day grace period."}
    except Exception as e:
        print(f"DEV ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dev-delete-user", tags=["Development Only"])
async def dev_delete_user(email: str):
    """
    TEMPORARY: Deletes a user by email so you can sign up again.
    """
    try:
        result = await users_collection.delete_many({"email": email.lower()})
        if result.deleted_count == 0:
            return {"message": "User not found"}
        return {"message": f"User {email} deleted successfully ({result.deleted_count} records removed). You can now register again."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ---------------------------------------

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/verify-email")
async def verify_email(token: str):
    try:
        token_hash = hash_token(token)
        print(f"[DEBUG] Incoming Token: {token}")
        print(f"[DEBUG] Generated Hash: {token_hash}")
        
        user = await users_collection.find_one({
            "verification_token_hash": token_hash,
            "email_verified": False
        })
        
        if not user:
            print(f"[DEBUG] No unverified user found with hash: {token_hash}")
            raise HTTPException(status_code=400, detail="Invalid or expired verification token")
        
        print(f"[DEBUG] Found user: {user.get('email')}. Verifying...")
        
        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"email_verified": True},
                "$unset": {"verification_token_hash": "", "verification_token_expires": ""}
            }
        )
        
        return {"message": "Email verified successfully! You can now use all features."}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"ERROR in verify_email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/resend-verification")
async def resend_verification(current_user: dict = Depends(get_current_user)):
    try:
        if current_user.get("email_verified"):
            return {"message": "Email is already verified"}
        
        new_token = generate_verification_token()
        # Extend deadline to 2 days from NOW for better UX
        new_deadline = datetime.utcnow() + timedelta(days=2)
        
        await users_collection.update_one(
            {"email": current_user["email"]},
            {
                "$set": {
                    "verification_token_hash": hash_token(new_token),
                    "verification_deadline": new_deadline
                }
            }
        )
        
        await send_verification_email(current_user["email"], new_token)
        return {"message": "Verification email resent. You have 2 more days to verify."}
    except Exception as e:
        print(f"ERROR in resend_verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to resend verification email")
