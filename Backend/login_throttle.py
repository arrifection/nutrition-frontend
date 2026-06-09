"""Account-level login throttling after repeated failed attempts."""
from datetime import datetime, timedelta

from fastapi import HTTPException, status

from database import users_collection

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def check_login_allowed(email: str) -> None:
    user = await users_collection.find_one({"email": email.lower()})
    if not user:
        return

    locked_until = user.get("login_locked_until")
    if locked_until and isinstance(locked_until, datetime) and locked_until > datetime.utcnow():
        remaining = int((locked_until - datetime.utcnow()).total_seconds() / 60) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Try again in about {remaining} minute(s).",
        )


async def record_failed_login(email: str) -> None:
    email = email.lower()
    user = await users_collection.find_one({"email": email})
    if not user:
        return

    attempts = int(user.get("failed_login_attempts") or 0) + 1
    update: dict = {"failed_login_attempts": attempts}

    if attempts >= MAX_FAILED_ATTEMPTS:
        update["login_locked_until"] = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)

    await users_collection.update_one({"_id": user["_id"]}, {"$set": update})


async def clear_failed_logins(email: str) -> None:
    await users_collection.update_one(
        {"email": email.lower()},
        {"$set": {"failed_login_attempts": 0}, "$unset": {"login_locked_until": ""}},
    )
