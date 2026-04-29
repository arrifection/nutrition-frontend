import asyncio
import certifi
import motor.motor_asyncio
from pydantic import BaseModel, Field
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://nexusnao:2xTLMDSy7600@cluster0.z4lzt6j.mongodb.net/?appName=Cluster0")

try:
    ca = certifi.where()
    client = motor.motor_asyncio.AsyncIOMotorClient(
        MONGODB_URL,
        tls=True,
        tlsCAFile=ca,
        serverSelectionTimeoutMS=10000, # Increased timeout
        connectTimeoutMS=10000
    )
except Exception as e:
    print(f"CRITICAL: Failed to initialize MongoDB client: {e}")
    # Fallback without tlsCAFile if it fails
    client = motor.motor_asyncio.AsyncIOMotorClient(
        MONGODB_URL,
        serverSelectionTimeoutMS=10000
    )

async def check_db():
    try:
        # Use a short timeout for the ping
        await asyncio.wait_for(client.admin.command('ping'), timeout=5.0)
        print("MongoDB Atlas Connected Successfully!")
        return True
    except Exception as e:
        print(f"MongoDB Connection Failed: {type(e).__name__} - {e}")
        return False


# Get Database name from env or default
DB_NAME = os.getenv("DATABASE_NAME", "nutripro_db")
db = client[DB_NAME]

# Collections
patients_collection = db.get_collection("patients")
plans_collection = db.get_collection("diet_plans")
logs_collection = db.get_collection("reflection_logs")
users_collection = db.get_collection("users")
history_collection = db.get_collection("history")

# Helper to format MongoDB _id to string id
def patient_helper(patient) -> dict:
    return {
        "id": str(patient["_id"]),
        "name": patient["name"],
        "age": patient["age"],
        "gender": patient["gender"],
        "height": patient["height"],
        "weight": patient["weight"],
        "activity_level": patient["activity_level"],
        "allergies": patient.get("allergies"),
        "dietary_restrictions": patient.get("dietary_restrictions"),
        "goal": patient["goal"],
        "bmi": patient.get("bmi"),
        "bmr": patient.get("bmr"),
        "tdee": patient.get("tdee"),
        "medical_notes": patient.get("medical_notes"),
        "owner_id": patient.get("owner_id")
    }

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "client"),
        "createdAt": user.get("createdAt")
    }

