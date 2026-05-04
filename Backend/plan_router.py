from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from plan import WeeklyPlan
from database import plans_collection
from auth_router import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/v1", tags=["plans"])

def serialize_plan(plan: dict) -> dict:
    plan = dict(plan)
    plan["id"] = str(plan.pop("_id"))
    for field in ["saved_at", "archived_at"]:
        if plan.get(field) and hasattr(plan[field], "isoformat"):
            plan[field] = plan[field].isoformat()
    return plan

@router.get("/plans/{patient_id}", response_model=WeeklyPlan)
async def get_plan(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve the weekly diet plan for a specific patient (only if owned by current user)"""
    plan = await plans_collection.find_one({
        "patient_id": patient_id,
        "owner_id": current_user["id"],
        "is_current": True
    })
    if not plan:
        plan = await plans_collection.find_one({
            "patient_id": patient_id,
            "owner_id": current_user["id"],
            "is_current": {"$ne": False}
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
    now = datetime.utcnow()
    
    await plans_collection.update_many(
        {
            "patient_id": patient_id,
            "owner_id": current_user["id"],
            "is_current": {"$ne": False}
        },
        {
            "$set": {
                "is_current": False,
                "status": "previous",
                "archived_at": now
            }
        }
    )

    plan_dict.update({
        "is_current": True,
        "status": "active",
        "saved_at": now
    })

    await plans_collection.insert_one(plan_dict)
    
    return plan

@router.get("/plans/{patient_id}/history")
async def get_plan_history(patient_id: str, current_user: dict = Depends(get_current_user)):
    """List active and previous saved plans for a patient."""
    cursor = plans_collection.find({
        "patient_id": patient_id,
        "owner_id": current_user["id"]
    }).sort("saved_at", -1)
    plans = [serialize_plan(plan) async for plan in cursor]
    return {"plans": plans}

@router.delete("/plans/{patient_id}/history/{plan_id}")
async def delete_plan_history_item(patient_id: str, plan_id: str, current_user: dict = Depends(get_current_user)):
    """Delete one saved plan version for a patient."""
    if not ObjectId.is_valid(plan_id):
        raise HTTPException(status_code=400, detail="Invalid plan id")

    result = await plans_collection.delete_one({
        "_id": ObjectId(plan_id),
        "patient_id": patient_id,
        "owner_id": current_user["id"]
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")

    current = await plans_collection.find_one({
        "patient_id": patient_id,
        "owner_id": current_user["id"],
        "is_current": True
    })

    if not current:
        latest_previous = await plans_collection.find_one(
            {"patient_id": patient_id, "owner_id": current_user["id"]},
            sort=[("saved_at", -1)]
        )
        if latest_previous:
            await plans_collection.update_one(
                {"_id": latest_previous["_id"]},
                {"$set": {"is_current": True, "status": "active"}, "$unset": {"archived_at": ""}}
            )
    
    return {"message": "Plan deleted successfully"}
