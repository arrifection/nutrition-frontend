# Backend for DietDesk MVP - v2.1 Sync (Token Fix)
import asyncio
import logging
import os
import time

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from runtime_env import resolve_environment
from sentry_config import init_sentry, is_sentry_enabled

init_sentry()

from advice import router as advice_router
from allergen_router import router as allergen_router
from assessment_router import router as assessment_router
from auth_router import router as auth_router
from mfa_router import router as mfa_router
from bmi import router as bmi_router
from bmr import router as bmr_router
from clinical_router import router as clinical_router
from database import get_cached_db_status, quick_db_ping, refresh_collections
from client_log_router import router as client_log_router
from debug_router import router as debug_router
from email_utils import get_email_config_status, log_email_config_on_startup
from exchange_list import router as exchange_router, seed_food_data
from history_router import router as history_router
from macros import router as macros_router
from patient_router import router as patient_router
from pdf_export_router import router as pdf_export_router
from plan_router import router as plan_router
from rate_limit import check_rate_limit
from security_middleware import add_security_headers, validate_secret_key

validate_secret_key()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

REQUIRED_ENV_VARS = [
    "MONGODB_URL",
    "SECRET_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "FRONTEND_URL",
]


def _log_startup_env_status() -> None:
    missing = [name for name in REQUIRED_ENV_VARS if not os.getenv(name, "").strip()]
    if missing:
        logger.warning("[STARTUP] Missing environment variables: %s", ", ".join(missing))
    else:
        logger.info("[STARTUP] All required environment variables are set")

    email_status = get_email_config_status()
    with open("startup_check.txt", "a") as f:
        f.write(f"EMAIL_CONFIG={email_status}\n")
        if missing:
            f.write(f"MISSING_ENV={missing}\n")


async def _background_startup() -> None:
    """Non-blocking startup: DB connect, collection bind, optional food seed."""
    try:
        log_email_config_on_startup()
        _log_startup_env_status()

        for attempt in range(6):
            refresh_collections()
            if await quick_db_ping(timeout_seconds=5.0 + attempt * 2.0):
                with open("startup_check.txt", "a") as f:
                    f.write("DB CONNECTED\n")
                await seed_food_data()
                return

            wait = 3 * (attempt + 1)
            logger.warning("[STARTUP] DB not ready (attempt %s/6). Retrying in %ss...", attempt + 1, wait)
            await asyncio.sleep(wait)

        with open("startup_check.txt", "a") as f:
            f.write("DB FAILED\n")
        logger.error(
            "[STARTUP] Database unreachable after retries. Auth will retry on each request. "
            "Check MONGODB_URL and Atlas Network Access (allow 0.0.0.0/0 for Hugging Face)."
        )
    except Exception as exc:
        logger.exception("[STARTUP] Background initialization failed: %s", exc)


@app.on_event("startup")
async def startup_db_client():
    with open("startup_check.txt", "w") as f:
        f.write("STARTUP RUNNING\n")
    asyncio.create_task(_background_startup())

@app.middleware("http")
async def security_and_rate_limit(request: Request, call_next):
    try:
        check_rate_limit(request)
    except HTTPException as exc:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None) or {},
        )
    return await add_security_headers(request, call_next)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    if request.url.path in {"/health", "/warmup"}:
        return response

    log_line = f"{request.method} {request.url.path} -> {response.status_code} ({process_time:.2f}ms)"
    if response.status_code >= 500:
        logger.error("[REQUEST] %s", log_line)
    elif response.status_code >= 400:
        logger.warning("[REQUEST] %s", log_line)
    else:
        logger.info("[REQUEST] %s", log_line)
    return response

default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://dietdesk.online",
    "https://www.dietdesk.online",
    "https://nutrition-frontend-pink.vercel.app",
    "https://nutrition-frontend-3dda.vercel.app",
]
extra_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
allow_origins = sorted(set(default_origins + extra_origins))
allow_origin_regex = os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bmi_router)
app.include_router(advice_router)
app.include_router(bmr_router)
app.include_router(macros_router)
app.include_router(exchange_router)
app.include_router(patient_router)
app.include_router(plan_router)
app.include_router(clinical_router)
app.include_router(assessment_router)
app.include_router(allergen_router)
app.include_router(auth_router)
app.include_router(mfa_router)
app.include_router(client_log_router)
app.include_router(debug_router)
app.include_router(history_router)
app.include_router(pdf_export_router)


@app.get("/")
def home():
    return {"message": "Backend is running successfully", "release": os.getenv("SENTRY_RELEASE", "unknown")}


@app.get("/health")
async def health_check():
    """Fast liveness probe — never blocks on a live database ping."""
    db_status = get_cached_db_status()
    ready = db_status == "connected"
    return {
        "status": "healthy" if ready or db_status in {"unknown", "stale"} else "degraded",
        "database": db_status,
        "environment": resolve_environment(),
        "release": os.getenv("SENTRY_RELEASE", "unknown"),
        "sentry": "enabled" if is_sentry_enabled() else "disabled",
    }


@app.get("/warmup")
async def warmup(ping_db: bool = True):
    """Lightweight wake-up probe. Optional short DB ping (default 2s timeout)."""
    db_ok = None
    if ping_db:
        db_ok = await quick_db_ping()
    return {
        "status": "warm",
        "database": (
            "connected" if db_ok else "unreachable" if db_ok is False else "skipped"
        ),
        "environment": resolve_environment(),
    }


@app.get("/internal/sentry-test", tags=["Monitoring"])
async def sentry_test():
    if os.getenv("ENABLE_SENTRY_TEST", "false").lower() not in {"1", "true", "yes"}:
        raise HTTPException(status_code=404, detail="Not found")
    raise RuntimeError("DietDesk Sentry backend test error — safe to ignore after verification")

