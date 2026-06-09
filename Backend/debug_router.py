import logging
import os
import traceback

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from email_utils import get_email_config_status, send_test_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/debug", tags=["Debug"])


class TestEmailRequest(BaseModel):
    email: EmailStr


@router.post("/test-email")
async def test_email(data: TestEmailRequest):
    """
    Temporary diagnostic endpoint: sends a test email directly through Resend.
    Enable with DEBUG_EMAIL_ENABLED=true on the server.
    """
    if os.getenv("DEBUG_EMAIL_ENABLED", "false").lower() not in {"1", "true", "yes"}:
        raise HTTPException(
            status_code=403,
            detail="Debug email endpoint is disabled. Set DEBUG_EMAIL_ENABLED=true to enable.",
        )

    target_email = data.email.lower()
    config = get_email_config_status()

    logger.info("[DEBUG TEST EMAIL] Request received for %s", target_email)
    logger.info("[DEBUG TEST EMAIL] Config: %s", config)

    try:
        result = await send_test_email(target_email)
        payload = {
            "success": result.success,
            "config": config,
            "resend_status_code": result.status_code,
            "resend_response": result.response_body,
            "error_message": result.error_message,
        }
        if not result.success:
            logger.error("[DEBUG TEST EMAIL] Failed: %s", result.error_message)
            return payload
        logger.info("[DEBUG TEST EMAIL] Success for %s", target_email)
        return payload
    except Exception as exc:
        logger.error("[DEBUG TEST EMAIL] Unhandled exception: %s", exc)
        logger.error("[DEBUG TEST EMAIL] Traceback:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "config": config,
                "error_message": f"{type(exc).__name__}: {exc}",
                "traceback": traceback.format_exc(),
            },
        )
