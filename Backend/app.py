# Backend for DietDesk MVP - v2.1 Sync (Token Fix)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bmi import router as bmi_router
from advice import router as advice_router
from bmr import router as bmr_router
from macros import router as macros_router
from exchange_list import router as exchange_router, seed_food_data
from patient_router import router as patient_router
from plan_router import router as plan_router
from clinical_router import router as clinical_router
from auth_router import router as auth_router
from history_router import router as history_router

from fastapi import Request
import time
import os
from dotenv import load_dotenv

from database import check_db, refresh_collections

load_dotenv()

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    with open("startup_check.txt", "w") as f:
        f.write("STARTUP RUNNING\n")
    refresh_collections() # Bind collections to the active client
    if await check_db():
        with open("startup_check.txt", "a") as f:
            f.write("DB CONNECTED\n")
        await seed_food_data()
    else:
        with open("startup_check.txt", "a") as f:
            f.write("DB FAILED\n")
        print("[WARN] Skipping startup seed: Database not reachable. The app will continue, but DB features will fail.")

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
app.include_router(history_router)


@app.get("/")
def home():
    return {"message": "Backend is running successfully - v2.3 (Auth Fix)"}

