"""Resolve deployment environment for production-only behavior."""
import os


def resolve_environment() -> str:
    """Return normalized environment name used by Sentry, health, and security checks."""
    explicit = (os.getenv("ENVIRONMENT") or os.getenv("APP_ENV") or "").strip().lower()
    if explicit in {"production", "prod", "development", "dev", "staging", "test"}:
        return "production" if explicit in {"production", "prod"} else explicit

    # Hugging Face Spaces runtime hints
    if os.getenv("SPACE_ID") or os.getenv("SPACE_REPO_NAME"):
        return "production"

    host = (os.getenv("HOSTNAME") or os.getenv("SPACE_HOST") or "").lower()
    if host.endswith(".hf.space") or "hf.space" in host:
        return "production"

    frontend = (os.getenv("FRONTEND_URL") or "").lower()
    if "dietdesk.online" in frontend:
        return "production"

    return "development"


def is_production() -> bool:
    return resolve_environment() in {"production", "prod"}
