import logging
import traceback

from fastapi import APIRouter, HTTPException, Depends, status
from patient import PatientProfile
from database import patients_collection, patient_helper
from auth_router import get_current_user, _is_db_connection_error, _raise_db_unavailable
from bson import ObjectId
from nutrition_assessment import AssessmentValidationError, compute_full_assessment

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["patients"])


def _basic_metrics(profile_dict: dict) -> dict:
    """Fallback BMI/BMR when full assessment validation fails."""
    height_m = profile_dict["height"] / 100
    weight = profile_dict["weight"]
    age = profile_dict["age"]
    gender = profile_dict.get("gender", "female").lower()
    profile_dict["bmi"] = round(weight / (height_m ** 2), 2)
    if gender == "male":
        bmr = (10 * weight) + (6.25 * profile_dict["height"]) - (5 * age) + 5
    else:
        bmr = (10 * weight) + (6.25 * profile_dict["height"]) - (5 * age) - 161
    profile_dict["bmr"] = round(bmr)
    profile_dict["tdee"] = profile_dict["bmr"]
    profile_dict["assessment"] = None
    return profile_dict


def calculate_metrics(profile_dict: dict) -> dict:
    """Calculate BMI, BMR, TDEE, and extended assessment summary for a patient profile."""
    try:
        assessment = compute_full_assessment(
            weight_kg=profile_dict["weight"],
            height_cm=profile_dict["height"],
            age=profile_dict["age"],
            gender=profile_dict["gender"],
            activity_level=profile_dict.get("activity_level", "sedentary"),
            goal=profile_dict.get("goal", "maintenance"),
        )
        summary = assessment["summary"]
        profile_dict["bmi"] = summary["bmi"]
        profile_dict["bmr"] = summary["bmr"]
        profile_dict["tdee"] = summary["goal_calories"]
        profile_dict["assessment"] = assessment
        return profile_dict
    except AssessmentValidationError as exc:
        logger.warning("[PATIENT METRICS] Assessment validation failed, using basic metrics: %s", exc)
        return _basic_metrics(profile_dict)


@router.post("/patients", response_model=PatientProfile)
async def create_patient(profile: PatientProfile, current_user: dict = Depends(get_current_user)):
    """Create a new patient in the database"""
    try:
        print(f"📥 Received new patient request: {profile.name} from user: {current_user['email']}")
        profile_dict = profile.model_dump(exclude={"id", "owner_id"})
        profile_dict = calculate_metrics(profile_dict)
        profile_dict["owner_id"] = current_user["id"]

        result = await patients_collection.insert_one(profile_dict)
        new_patient = await patients_collection.find_one({"_id": result.inserted_id})
        return patient_helper(new_patient)
    except HTTPException:
        raise
    except Exception as exc:
        if _is_db_connection_error(exc):
            logger.error("[PATIENT CREATE] DB error for %s: %s", current_user.get("email"), exc)
            _raise_db_unavailable()
        logger.error("[PATIENT CREATE] Unexpected error: %s\n%s", exc, traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="We couldn't save this patient right now. Please try again.",
        )


@router.get("/patients/{patient_id}", response_model=PatientProfile)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Get a patient by ID (only if owned by current user)"""
    try:
        patient = await patients_collection.find_one({
            "_id": ObjectId(patient_id),
            "owner_id": current_user["id"]
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")
    
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient_helper(patient)


@router.put("/patients/{patient_id}", response_model=PatientProfile)
async def update_patient(patient_id: str, updated_profile: PatientProfile, current_user: dict = Depends(get_current_user)):
    """Update an existing patient (only if owned by current user)"""
    try:
        patient_oid = ObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")

    try:
        existing = await patients_collection.find_one({
            "_id": patient_oid,
            "owner_id": current_user["id"]
        })
        if existing is None:
            raise HTTPException(status_code=404, detail="Patient not found")

        profile_dict = updated_profile.model_dump(exclude={"id", "owner_id"})
        profile_dict = calculate_metrics(profile_dict)

        await patients_collection.update_one(
            {"_id": patient_oid, "owner_id": current_user["id"]},
            {"$set": profile_dict}
        )

        updated = await patients_collection.find_one({"_id": patient_oid})
        return patient_helper(updated)
    except HTTPException:
        raise
    except Exception as exc:
        if _is_db_connection_error(exc):
            _raise_db_unavailable()
        logger.error("[PATIENT UPDATE] Unexpected error: %s\n%s", exc, traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="We couldn't update this patient right now. Please try again.",
        )



@router.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a patient by ID (only if owned by current user)"""
    try:
        result = await patients_collection.delete_one({
            "_id": ObjectId(patient_id),
            "owner_id": current_user["id"]
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {"message": "Patient deleted successfully", "id": patient_id}


@router.get("/patients", response_model=list[PatientProfile])
async def list_patients(current_user: dict = Depends(get_current_user)):
    """Get all patients owned by the current user"""
    patients = []
    async for patient in patients_collection.find({"owner_id": current_user["id"]}):
        patients.append(patient_helper(patient))
    return patients
