import logging
import os
import traceback
from dataclasses import dataclass
from typing import Any, Optional

import httpx
from dotenv import load_dotenv

from runtime_env import is_production, resolve_environment

load_dotenv()

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev").strip()

_default_frontend = "https://dietdesk.online" if is_production() else "http://localhost:5173"
FRONTEND_URL = (os.getenv("FRONTEND_URL") or _default_frontend).rstrip("/")
RESEND_API_URL = "https://api.resend.com/emails"


def mask_secret(value: Optional[str]) -> str:
    if not value:
        return "(not set)"
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


def get_email_config_status() -> dict:
    """Startup-safe summary of Resend configuration (no secrets exposed)."""
    return {
        "resend_api_key_set": bool(RESEND_API_KEY),
        "resend_api_key_masked": mask_secret(RESEND_API_KEY),
        "resend_from_email": RESEND_FROM_EMAIL,
        "frontend_url": FRONTEND_URL,
    }


def log_email_config_on_startup() -> None:
    status = get_email_config_status()
    logger.info(
        "[EMAIL CONFIG] api_key_set=%s masked=%s from=%s frontend_url=%s",
        status["resend_api_key_set"],
        status["resend_api_key_masked"],
        status["resend_from_email"],
        status["frontend_url"],
    )
    if not status["resend_api_key_set"]:
        logger.warning(
            "[EMAIL CONFIG] RESEND_API_KEY is missing or empty. Verification emails will fail."
        )


def _verification_link(token: str) -> str:
    return f"{FRONTEND_URL}/verify-email?token={token}"


@dataclass
class EmailSendResult:
    success: bool
    status_code: Optional[int] = None
    response_body: Any = None
    error_message: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "status_code": self.status_code,
            "response_body": self.response_body,
            "error_message": self.error_message,
        }


async def _send_resend_email(
    to_email: str,
    subject: str,
    html: str,
    *,
    log_prefix: str = "EMAIL",
) -> EmailSendResult:
    if not RESEND_API_KEY:
        msg = "RESEND_API_KEY is not set or empty"
        logger.warning("[%s] %s", log_prefix, msg)
        return EmailSendResult(success=False, error_message=msg)

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": f"DietDesk <{RESEND_FROM_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": html,
    }

    logger.info(
        "[%s] Sending to=%s from=%s subject=%s",
        log_prefix,
        to_email,
        RESEND_FROM_EMAIL,
        subject,
    )

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(RESEND_API_URL, headers=headers, json=payload)
            body_text = response.text
            try:
                body_json = response.json()
            except Exception:
                body_json = body_text

            if response.status_code in (200, 201):
                logger.info("[%s] Sent successfully to %s (status=%s)", log_prefix, to_email, response.status_code)
                return EmailSendResult(
                    success=True,
                    status_code=response.status_code,
                    response_body=body_json,
                )

            error_msg = f"Resend API error {response.status_code}: {body_text}"
            logger.error("[%s] %s", log_prefix, error_msg)
            return EmailSendResult(
                success=False,
                status_code=response.status_code,
                response_body=body_json,
                error_message=error_msg,
            )
    except Exception as exc:
        error_msg = f"{type(exc).__name__}: {exc}"
        logger.error("[%s] Exception while calling Resend: %s", log_prefix, error_msg)
        logger.error("[%s] Traceback:\n%s", log_prefix, traceback.format_exc())
        return EmailSendResult(success=False, error_message=error_msg)


async def send_verification_email(email: str, token: str) -> EmailSendResult:
    """Sends a verification email using Resend API."""
    link = _verification_link(token)
    logger.info("[VERIFY EMAIL] Preparing verification email for %s link=%s", email, link)

    html = f"""
        <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
            <h1 style="font-size: 22px; margin-bottom: 12px;">Welcome to DietDesk</h1>
            <p style="line-height: 1.6; color: #475569;">
                Your dietitian account is ready. You can sign in right away, but please verify your email within 2 days to keep access.
            </p>
            <p style="margin: 24px 0;">
                <a href="{link}" style="background-color: #059669; color: white; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Verify Email
                </a>
            </p>
            <p style="font-size: 13px; color: #64748b; word-break: break-all;">Or copy this link: {link}</p>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">If you didn't sign up for DietDesk, you can ignore this email.</p>
        </div>
    """

    return await _send_resend_email(
        email,
        "Verify your DietDesk account",
        html,
        log_prefix="VERIFY EMAIL",
    )


async def send_test_email(to_email: str) -> EmailSendResult:
    """Sends a simple test email to isolate Resend configuration issues."""
    html = """
        <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
            <h1 style="font-size: 22px; margin-bottom: 12px;">DietDesk Email Test</h1>
            <p style="line-height: 1.6; color: #475569;">
                This is a test email from the DietDesk backend. If you received this, Resend is configured correctly.
            </p>
        </div>
    """
    return await _send_resend_email(
        to_email,
        "DietDesk Resend Test",
        html,
        log_prefix="TEST EMAIL",
    )
