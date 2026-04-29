from fastapi import APIRouter, HTTPException, Depends
from plan import WeeklyPlan
from database import plans_collection
from auth_router import get_current_user

router = APIRouter(prefix="/api/v1", tags=["plans"])

@router.get("/plans/{patient_id}", response_model=WeeklyPlan)
async def get_plan(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve the weekly diet plan for a specific patient (only if owned by current user)"""
    plan = await plans_collection.find_one({
        "patient_id": patient_id,
        "owner_id": current_user["id"]
    })
    if not plan:
        # Return a default empty plan if none exists yet
        return WeeklyPlan(patient_id=patient_id)
    
    # Remove the MongoDB internal _id before returning
    if "_id" in plan:
        del plan["_id"]
    return plan

@router.post("/plans/{patient_id}", response_model=WeeklyPlan)
async def save_plan(patient_id: str, plan: WeeklyPlan, current_user: dict = Depends(get_current_user)):
    """Save or update the weekly diet plan for a patient"""
    # Ensure patient_id is set
    plan.patient_id = patient_id
    # Automatically set the owner_id from the logged-in user
    plan.owner_id = current_user["id"]
    plan_dict = plan.model_dump()
    
    # Use upsert to create or update the plan
    await plans_collection.update_one(
        {"patient_id": patient_id, "owner_id": current_user["id"]},
        {"$set": plan_dict},
        upsert=True
    )
    
    return plan
