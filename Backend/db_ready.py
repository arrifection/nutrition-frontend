"""Ensure MongoDB is reachable before critical auth/DB operations."""
import asyncio
import logging

from fastapi import HTTPException, status
from pymongo.errors import (
    AutoReconnect,
    ConfigurationError,
    ConnectionFailure,
    NetworkTimeout,
    ServerSelectionTimeoutError,
)

from database import quick_db_ping, refresh_collections

logger = logging.getLogger(__name__)

DB_CONNECTION_ERRORS = (
    ServerSelectionTimeoutError,
    AutoReconnect,
    NetworkTimeout,
    ConfigurationError,
    ConnectionFailure,
)


def is_db_connection_error(error: Exception) -> bool:
    if isinstance(error, DB_CONNECTION_ERRORS):
        return True
    message = str(error).lower()
    return any(
        phrase in message
        for phrase in (
            "server selection timeout",
            "connection refused",
            "network is unreachable",
            "timed out",
            "nodename nor servname",
            "name or service not known",
            "ssl handshake failed",
            "connection closed",
        )
    )


def raise_db_unavailable() -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database is temporarily unreachable. Please wait a few seconds and try again.",
    )


async def ensure_db_ready(
    *,
    max_attempts: int = 4,
    initial_timeout_seconds: float = 3.0,
    backoff_seconds: float = 2.0,
) -> None:
    """
    Ping MongoDB with retries before auth writes.
    Raises 503 if the database stays unreachable (never a silent 500).
    """
    for attempt in range(max_attempts):
        timeout = initial_timeout_seconds + attempt * 2.0
        ok = await quick_db_ping(timeout_seconds=timeout)
        if ok:
            refresh_collections()
            if attempt > 0:
                logger.info("[DB] Connected after %s attempt(s)", attempt + 1)
            return

        if attempt < max_attempts - 1:
            wait = backoff_seconds * (attempt + 1)
            logger.warning(
                "[DB] Ping failed (attempt %s/%s). Retrying in %.1fs...",
                attempt + 1,
                max_attempts,
                wait,
            )
            await asyncio.sleep(wait)

    logger.error("[DB] Unreachable after %s attempts — auth request blocked", max_attempts)
    raise_db_unavailable()
