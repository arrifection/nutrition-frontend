# Backend for DietDesk MVP - v2.1 Sync (Token Fix)
import logging
import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from advice import router as advice_router
from auth_router import router as auth_router
from bmi import router as bmi_router
from bmr import router as bmr_router
from clinical_router import router as clinical_router
from database import check_db, refresh_collections
from debug_router import router as debug_router
from email_utils import get_email_config_status, log_email_config_on_startup
from exchange_list import router as exchange_router, seed_food_data
from history_router import router as history_router
from macros import router as macros_router
from patient_router import router as patient_router
from pdf_export_router import router as pdf_export_router
from plan_router import router as plan_router

load_dotenv()

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


@app.on_event("startup")
async def startup_db_client():
    with open("startup_check.txt", "w") as f:
        f.write("STARTUP RUNNING\n")

    log_email_config_on_startup()
    _log_startup_env_status()

    refresh_collections()
    if await check_db():
        with open("startup_check.txt", "a") as f:
            f.write("DB CONNECTED\n")
        await seed_food_data()
    else:
        with open("startup_check.txt", "a") as f:
            f.write("DB FAILED\n")
        logger.warning(
            "Skipping startup seed: Database not reachable. The app will continue, but DB features will fail."
        )

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    print(f"DEBUG: {request.method} {request.url.path} - {response.status_code} ({process_time:.2f}ms)")
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
app.include_router(auth_router)
app.include_router(debug_router)
app.include_router(history_router)
app.include_router(pdf_export_router)


@app.get("/")
def home():
    return {"message": "Backend is running successfully - v2.3 (Auth Fix)"}

