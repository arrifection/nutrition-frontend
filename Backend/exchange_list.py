from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from database import db

router = APIRouter(prefix="/api/v1", tags=["exchange-list"])

food_collection = db.get_collection("food_exchange")

# Threshold for detecting if we need to re-seed (full dataset is ~300+ items)
_FULL_SEED_THRESHOLD = 50

class TranslationStatus:
    DRAFT = "draft"
    REVIEWED = "reviewed"
    APPROVED = "approved"

class MultiLangText(BaseModel):
    en: str
    ur: Optional[str] = None

class FoodName(BaseModel):
    en: str
    ur_clinical: Optional[str] = None
    ur_patient: Optional[str] = None

class Macros(BaseModel):
    carbs_g: float
    protein_g: float
    fat_g: float
    calories: int

class FoodItem(BaseModel):
    id: str  # Permanent ID as primary key
    group: MultiLangText
    subcategory: MultiLangText
    food_name: FoodName
    serving_size: str
    macros: Macros
    translation_status: str = TranslationStatus.DRAFT
    is_active: bool = True
    notes: Optional[str] = None

def food_helper(food) -> dict:
    """Helper to convert MongoDB document to response dict."""
    return {
        "id": food["id"],
        "group": food["group"],
        "subcategory": food["subcategory"],
        "food_name": food["food_name"],
        "serving_size": food["serving_size"],
        "macros": food["macros"],
        "translation_status": food.get("translation_status", "draft"),
        "is_active": food.get("is_active", True),
        "notes": food.get("notes", "")
    }

async def _do_seed():
    """Drop the collection and re-insert the full dataset."""
    from exchange_list_data import EXCHANGE_LIST_INITIAL
    await food_collection.drop()
    # Create unique index on 'id'
    await food_collection.create_index("id", unique=True)
    result = await food_collection.insert_many(EXCHANGE_LIST_INITIAL)
    return len(result.inserted_ids)

async def seed_food_data():
    """Seed or re-seed the database with the multilingual food exchange dataset."""
    from database import check_db
    if not await check_db():
        print("[WARN] Skipping food seeding: Database not reachable")
        return

    try:
        count = await food_collection.count_documents({})
        # Always re-seed if we find old schema (missing 'macros' field at top level or similar)
        # or if the count is too low.
        sample = await food_collection.find_one({})
        needs_reseed = count < _FULL_SEED_THRESHOLD or (sample and "macros" not in sample)
        
        if count == 0 or needs_reseed:
            inserted = await _do_seed()
            print(f"[OK] Food Exchange List seeded: {inserted} items inserted (Multilingual)")
        else:
            print(f"[INFO] Food Exchange List already seeded ({count} items). Skipping.")
    except Exception as e:
        print(f"[ERROR] Error seeding food data: {e}")

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/exchange-list")
async def get_exchange_list(status: Optional[str] = None):
    """Returns the complete food exchange list."""
    query = {}
    if status:
        query["translation_status"] = status
        
    foods = []
    async for food in food_collection.find(query).sort(
        [("group.en", 1), ("subcategory.en", 1), ("food_name.en", 1)]
    ):
        foods.append(food_helper(food))

    return {"total_items": len(foods), "items": foods}

@router.get("/exchange-list/groups")
async def get_groups():
    """Returns the available food groups with translations."""
    # We aggregate to get unique group structures
    pipeline = [
        {"$group": {"_id": "$group.en", "group": {"$first": "$group"}}},
        {"$sort": {"_id": 1}}
    ]
    groups = []
    async for doc in food_collection.aggregate(pipeline):
        groups.append(doc["group"])
    return {"groups": groups}

@router.get("/exchange-list/group/{group_en}")
async def get_by_group(group_en: str):
    """Returns all foods in a specific group by English name."""
    foods = []
    async for food in food_collection.find({"group.en": group_en}).sort(
        [("subcategory.en", 1), ("food_name.en", 1)]
    ):
        foods.append(food_helper(food))

    if not foods:
        raise HTTPException(status_code=404, detail=f"No foods found for group '{group_en}'")

    return {"group": group_en, "total_items": len(foods), "items": foods}

@router.post("/exchange-list/reseed")
async def force_reseed():
    """Admin endpoint: drops and re-seeds the food exchange collection."""
    try:
        inserted = await _do_seed()
        return {
            "success": True,
            "message": "Food Exchange List re-seeded with multilingual dataset.",
            "items_inserted": inserted,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Re-seed failed: {e}")
