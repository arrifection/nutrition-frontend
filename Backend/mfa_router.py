import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr

from auth_router import get_current_user, _set_refresh_cookie
from auth_utils import create_access_token, decode_access_token
from database import users_collection
from mfa_utils import (
    decrypt_mfa_secret,
    encrypt_mfa_secret,
    generate_totp_secret,
    provisioning_uri,
    verify_totp,
)
from rate_limit import check_rate_limit
from refresh_token_service import issue_token_pair

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/mfa", tags=["MFA"])


class MfaCodeBody(BaseModel):
    code: str


class MfaVerifyLoginBody(BaseModel):
    email: EmailStr
    temp_token: str
    code: str


@router.post("/setup")
async def mfa_setup(request: Request, current_user: dict = Depends(get_current_user)):
    check_rate_limit(request)
    if current_user.get("mfa_enabled"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA is already enabled.")

    secret = generate_totp_secret()
    encrypted = encrypt_mfa_secret(secret)
    email = current_user["email"]

    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"mfa_secret": encrypted, "mfa_enabled": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    qr_uri = provisioning_uri(secret, email)
    return {"secret": secret, "qr_uri": qr_uri}


@router.post("/verify-setup")
async def mfa_verify_setup(
    body: MfaCodeBody,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    check_rate_limit(request)
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    secret = decrypt_mfa_secret(user.get("mfa_secret"))
    if not secret or not verify_totp(secret, body.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code. Try again.")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"mfa_enabled": True}},
    )
    logger.info("[MFA] Enabled for %s", current_user["email"])
    return {"success": True}


@router.post("/verify")
async def mfa_verify_login(body: MfaVerifyLoginBody, request: Request, response: Response):
    check_rate_limit(request)
    email = body.email.lower()

    payload = decode_access_token(body.temp_token)
    if not payload or not payload.get("mfa_pending"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired MFA session")

    token_email = payload.get("sub")
    if not token_email or token_email.lower() != email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired MFA session")

    user = await users_collection.find_one({"email": email})
    if not user or not user.get("mfa_enabled"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired MFA session")

    secret = decrypt_mfa_secret(user.get("mfa_secret"))
    if not secret or not verify_totp(secret, body.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid MFA code.")

    tokens = await issue_token_pair(user)
    _set_refresh_cookie(response, tokens["refresh_token"])

    logger.info("[MFA LOGIN] Success for %s", email)
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "expires_in": tokens["expires_in"],
        "token_type": "bearer",
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "client"),
    }


@router.delete("/disable")
async def mfa_disable(request: Request, current_user: dict = Depends(get_current_user)):
    check_rate_limit(request)
    result = await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"mfa_enabled": False}, "$unset": {"mfa_secret": ""}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    logger.info("[MFA] Disabled for %s", current_user["email"])
    return {"success": True}
