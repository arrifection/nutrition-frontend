from fastapi import APIRouter

from pydantic import BaseModel, Field

from typing import Any, Optional



from allergen_utils import (

    scan_meal_plan_conflicts,

    STANDARD_ALLERGENS,

    ALLERGEN_LABELS,

    resolve_patient_allergens,

)



router = APIRouter(prefix="/api/v1/allergens", tags=["Allergens"])





class AllergenScanRequest(BaseModel):

    patient_allergens: Optional[dict[str, Any]] = None

    patient_allergies: Optional[str] = None

    patient: Optional[dict[str, Any]] = None

    week_plan: dict[str, Any] = Field(default_factory=dict)





@router.get("/catalog")

async def allergen_catalog():

    return {

        "standard": [

            {"key": key, "label": ALLERGEN_LABELS[key]}

            for key in STANDARD_ALLERGENS

        ],

    }





@router.post("/scan")

async def scan_allergens(data: AllergenScanRequest):

    allergies_text = data.patient_allergies

    if not allergies_text and data.patient:

        allergies_text = data.patient.get("allergies")



    conflicts = scan_meal_plan_conflicts(

        patient_allergens=data.patient_allergens,

        week_plan=data.week_plan,

        allergies_text=allergies_text,

        patient=data.patient,

    )

    active = resolve_patient_allergens(data.patient) if data.patient else []

    if not active and allergies_text:

        from allergen_utils import parse_patient_allergies_text

        active = parse_patient_allergies_text(allergies_text)

    if not active and data.patient_allergens:

        from allergen_utils import get_active_patient_allergens

        active = get_active_patient_allergens(data.patient_allergens)



    return {

        "conflict_count": len(conflicts),

        "has_conflicts": len(conflicts) > 0,

        "conflicts": conflicts,

        "active_allergens": active,

    }


