from pydantic import BaseModel, Field
from typing import List, Optional


class PatientAllergens(BaseModel):
    peanut: bool = False
    tree_nut: bool = False
    milk: bool = False
    egg: bool = False
    soy: bool = False
    wheat: bool = False
    fish: bool = False
    shellfish: bool = False
    custom: List[str] = Field(default_factory=list)


class PatientProfile(BaseModel):
    id: Optional[str] = None
    name: str
    age: int
    gender: str
    height: float
    weight: float
    activity_level: str
    allergens: Optional[PatientAllergens] = None
    allergies: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    medical_notes: Optional[str] = None
    goal: str
    owner_id: Optional[str] = None
    bmi: Optional[float] = None
    bmr: Optional[float] = None
    tdee: Optional[float] = None
    assessment: Optional[dict] = None
