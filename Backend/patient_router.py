from fastapi import APIRouter, HTTPException, Depends
from patient import PatientProfile
from database import patients_collection, patient_helper
from auth_router import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/v1", tags=["patients"])


def calculate_metrics(profile_dict: dict) -> dict:
    """Calculate BMI, BMR, TDEE, and extended assessment summary for a patient profile."""
    from nutrition_assessment import compute_full_assessment

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


@router.post("/patients", response_model=PatientProfile)
async def create_patient(profile: PatientProfile, current_user: dict = Depends(get_current_user)):
    """Create a new patient in the database"""
    print(f"📥 Received new patient request: {profile.name} from user: {current_user['email']}")
    profile_dict = profile.model_dump(exclude={"id", "owner_id"})
    profile_dict = calculate_metrics(profile_dict)
    
    # Automatically set the owner_id from the logged-in user
    profile_dict["owner_id"] = current_user["id"]

    
    result = await patients_collection.insert_one(profile_dict)
    new_patient = await patients_collection.find_one({"_id": result.inserted_id})
    
    return patient_helper(new_patient)


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
        existing = await patients_collection.find_one({
            "_id": ObjectId(patient_id),
            "owner_id": current_user["id"]
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")
    
    if existing is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Exclude ID and Owner ID from update to prevent tampering
    profile_dict = updated_profile.model_dump(exclude={"id", "owner_id"})
    profile_dict = calculate_metrics(profile_dict)
    
    # Ensure we only update if the owner matches (Double-check)
    result = await patients_collection.update_one(
        {"_id": ObjectId(patient_id), "owner_id": current_user["id"]},
        {"$set": profile_dict}
    )
    
    if result.modified_count == 0:
        # This could happen if the data is identical or if ownership changed (which shouldn't happen)
        pass
    
    updated = await patients_collection.find_one({"_id": ObjectId(patient_id)})
    return patient_helper(updated)



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
