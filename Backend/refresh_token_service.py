"""Refresh token issuance, rotation, and revocation."""
import secrets
from datetime import datetime, timedelta
from typing import Any

from bson import ObjectId
from fastapi import HTTPException, status

from auth_utils import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    create_access_token,
    hash_token,
)
from database import refresh_sessions_collection, users_collection

REFRESH_COOKIE_NAME = "dietdesk_refresh"
REFRESH_COOKIE_PATH = "/"


def _new_family_id() -> str:
    return secrets.token_urlsafe(16)


async def issue_token_pair(user: dict[str, Any]) -> dict[str, Any]:
    email = user["email"]
    user_id = str(user["_id"])
    family_id = _new_family_id()
    refresh_plain = secrets.token_urlsafe(48)
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    await refresh_sessions_collection.insert_one({
        "user_id": user_id,
        "email": email,
        "token_hash": hash_token(refresh_plain),
        "family_id": family_id,
        "expires_at": expires_at,
        "revoked": False,
        "created_at": datetime.utcnow(),
    })

    access_token = create_access_token(data={"sub": email, "uid": user_id})
    return {
        "access_token": access_token,
        "refresh_token": refresh_plain,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "token_type": "bearer",
    }


async def rotate_refresh_token(refresh_plain: str) -> dict[str, Any]:
    if not refresh_plain:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")

    token_hash = hash_token(refresh_plain)
    session = await refresh_sessions_collection.find_one({"token_hash": token_hash})

    if not session or session.get("revoked"):
        if session and session.get("family_id"):
            await refresh_sessions_collection.update_many(
                {"family_id": session["family_id"]},
                {"$set": {"revoked": True}},
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    if session.get("expires_at") and session["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user = await users_collection.find_one({"_id": ObjectId(session["user_id"])})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    await refresh_sessions_collection.update_one(
        {"_id": session["_id"]},
        {"$set": {"revoked": True}},
    )

    new_refresh = secrets.token_urlsafe(48)
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    await refresh_sessions_collection.insert_one({
        "user_id": session["user_id"],
        "email": session["email"],
        "token_hash": hash_token(new_refresh),
        "family_id": session["family_id"],
        "expires_at": expires_at,
        "revoked": False,
        "created_at": datetime.utcnow(),
    })

    access_token = create_access_token(data={"sub": user["email"], "uid": str(user["_id"])})
    return {
        "access_token": access_token,
        "refresh_token": new_refresh,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "token_type": "bearer",
    }


async def revoke_refresh_token(refresh_plain: str | None) -> None:
    if not refresh_plain:
        return
    token_hash = hash_token(refresh_plain)
    await refresh_sessions_collection.update_one(
        {"token_hash": token_hash},
        {"$set": {"revoked": True}},
    )
