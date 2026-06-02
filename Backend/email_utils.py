import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def _verification_link(token: str) -> str:
    return f"{FRONTEND_URL}/verify-email?token={token}"


async def send_verification_email(email: str, token: str) -> bool:
    """Sends a verification email using Resend API. Returns True if sent."""
    link = _verification_link(token)

    if not RESEND_API_KEY:
        print(f"[WARN] RESEND_API_KEY not set. Verification link for {email}: {link}")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "from": f"DietDesk <{RESEND_FROM_EMAIL}>",
        "to": [email],
        "subject": "Verify your DietDesk account",
        "html": f"""
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
        """,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code in (200, 201):
                print(f"[EMAIL] Verification sent to {email}")
                return True
            print(f"[EMAIL ERROR] {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[EMAIL ERROR] Exception: {str(e)}")
        return False
