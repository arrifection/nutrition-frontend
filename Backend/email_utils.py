import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

async def send_verification_email(email: str, token: str):
    """Sends a verification email using Resend API."""
    if not RESEND_API_KEY:
        print(f"[WARN] RESEND_API_KEY not set. Verification link for {email}: {FRONTEND_URL}/verify-email?token={token}")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
    
    payload = {
        "from": f"Diet Desk <{RESEND_FROM_EMAIL}>",
        "to": [email],
        "subject": "Verify your Diet Desk account",
        "html": f"""
            <h1>Welcome to Diet Desk!</h1>
            <p>You can use your account immediately, but please verify your email within 2 days to keep access.</p>
            <p>Click the link below to verify:</p>
            <a href="{verification_link}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>Or copy this link: {verification_link}</p>
            <br>
            <p>If you didn't sign up for Diet Desk, please ignore this email.</p>
        """
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200 or response.status_code == 201:
                print(f"[EMAIL] Verification sent to {email}")
                return True
            else:
                print(f"[EMAIL ERROR] {response.status_code}: {response.text}")
                return False
    except Exception as e:
        print(f"[EMAIL ERROR] Exception: {str(e)}")
        return False
