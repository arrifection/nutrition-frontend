from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from nutrition_assessment import AssessmentValidationError, compute_full_assessment

router = APIRouter(prefix="/assessment", tags=["Nutrition Assessment"])


class AssessmentInput(BaseModel):
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    age: int = Field(..., ge=1, le=120)
    gender: str
    activity_level: str = "sedentary"
    goal: str = "maintenance"
    protein_factor_g_per_kg: float = Field(default=1.0, ge=0.6, le=2.5)


@router.post("/calculate")
async def calculate_assessment(data: AssessmentInput):
    try:
        result = compute_full_assessment(
            weight_kg=data.weight_kg,
            height_cm=data.height_cm,
            age=data.age,
            gender=data.gender,
            activity_level=data.activity_level,
            goal=data.goal,
            protein_factor_g_per_kg=data.protein_factor_g_per_kg,
        )
        return result
    except AssessmentValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {type(exc).__name__}")
