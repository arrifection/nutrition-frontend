import logging
from typing import Any, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/client-log", tags=["Client Logs"])


class ClientLogEntry(BaseModel):
    level: str = Field(default="error", max_length=16)
    action: str = Field(..., max_length=64)
    user_message: str = Field(..., max_length=500)
    technical_message: Optional[str] = Field(default=None, max_length=1000)
    path: Optional[str] = Field(default=None, max_length=200)
    status: Optional[int] = None
    page: Optional[str] = Field(default=None, max_length=200)


@router.post("")
async def ingest_client_log(entry: ClientLogEntry):
    """Receives sanitized frontend errors for real-time HF container log monitoring."""
    payload: dict[str, Any] = {
        "action": entry.action,
        "user_message": entry.user_message,
        "technical_message": entry.technical_message,
        "path": entry.path,
        "status": entry.status,
        "page": entry.page,
    }

    level = entry.level.lower()
    if level == "warning":
        logger.warning("[CLIENT] %s", payload)
    elif level == "info":
        logger.info("[CLIENT] %s", payload)
    else:
        logger.error("[CLIENT] %s", payload)

    return {"logged": True}
