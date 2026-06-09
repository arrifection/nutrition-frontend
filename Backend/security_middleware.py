"""Security headers and production secret validation."""
import os

from fastapi import Request

INSECURE_SECRET_PLACEHOLDER = "your-super-secret-key-change-this-in-production"

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-XSS-Protection": "0",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: blob: https:; "
        "connect-src 'self' https://dietdesk.online https://www.dietdesk.online "
        "https://arrifection-nutrition-backend.hf.space http://127.0.0.1:8000 http://localhost:8000; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    ),
}


def validate_secret_key() -> None:
    secret = os.getenv("SECRET_KEY", "").strip()
    env = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower()
    if env in {"production", "prod"} and (not secret or secret == INSECURE_SECRET_PLACEHOLDER):
        raise RuntimeError("SECRET_KEY must be set to a strong value in production.")


async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    for key, value in SECURITY_HEADERS.items():
        if key not in response.headers:
            response.headers[key] = value
    return response
