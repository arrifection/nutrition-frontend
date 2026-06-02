from datetime import datetime
from io import BytesIO
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fpdf import FPDF
from pydantic import BaseModel

from auth_router import get_current_user

router = APIRouter(tags=["export"])


class ExportPdfRequest(BaseModel):
    patientData: dict
    macroTargets: dict
    weekPlan: dict
    dietaryFocus: str = ""
    selectedDay: Optional[str] = None
    templateId: str = "clinical-classic"


def _safe_text(value: Any) -> str:
    if value is None:
        return "-"
    text = str(value)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def _build_pdf(body: ExportPdfRequest) -> bytes:
    patient = body.patientData or {}
    macros = body.macroTargets or {}
    week_plan = body.weekPlan or {}

    if not patient:
        raise HTTPException(status_code=400, detail="Patient data is required")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Clinical Diet Plan Report", ln=True)

    pdf.set_font("Helvetica", "", 10)
    patient_name = _safe_text(patient.get("name") or patient.get("patient_name") or "Patient")
    report_date = datetime.utcnow().strftime("%d %b %Y")
    pdf.cell(0, 6, f"Patient: {patient_name}  |  Date: {report_date}", ln=True)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Patient Information", ln=True)
    pdf.set_font("Helvetica", "", 10)
    for label, key in [
        ("Age", "age"),
        ("Gender", "gender"),
        ("Height", "height"),
        ("Weight", "weight"),
        ("Activity Level", "activity_level"),
        ("Goal", "goal"),
    ]:
        value = patient.get(key)
        if value is not None and value != "":
            pdf.cell(0, 6, f"{label}: {_safe_text(value)}", ln=True)

    pdf.ln(3)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Daily Energy & Macronutrient Targets", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Calories: {_safe_text(macros.get('calories', '-'))} kcal", ln=True)
    pdf.cell(0, 6, f"Carbs: {_safe_text(macros.get('carbs', '-'))} g", ln=True)
    pdf.cell(0, 6, f"Protein: {_safe_text(macros.get('protein', '-'))} g", ln=True)
    pdf.cell(0, 6, f"Fat: {_safe_text(macros.get('fat', '-'))} g", ln=True)

    if body.dietaryFocus and body.dietaryFocus.strip():
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Dietary Focus / Approach", ln=True)
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 6, _safe_text(body.dietaryFocus.strip()))

    days = [body.selectedDay] if body.selectedDay else list(week_plan.keys())
    meal_keys = [
        ("breakfast", "Breakfast"),
        ("snack", "Snack"),
        ("lunch", "Lunch"),
        ("dinner", "Dinner"),
    ]

    for day in days:
        day_meals = week_plan.get(day) or {}
        pdf.ln(4)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, f"Daily Meal Plan - {_safe_text(day)}", ln=True)
        pdf.set_font("Helvetica", "", 9)

        for meal_key, meal_label in meal_keys:
            foods = day_meals.get(meal_key) or []
            if not foods:
                pdf.cell(0, 5, f"{meal_label}: -", ln=True)
                continue

            names = ", ".join(
                _safe_text(item.get("food_name", {}).get("en") if isinstance(item.get("food_name"), dict) else item.get("food_name") or item.get("name") or "Unknown")
                for item in foods
            )
            total_cals = sum(
                (item.get("macros") or {}).get("calories") or item.get("calories") or 0
                for item in foods
            )
            pdf.multi_cell(0, 5, f"{meal_label}: {names} ({int(total_cals)} kcal)")

    buffer = BytesIO()
    pdf.output(buffer)
    return buffer.getvalue()


@router.post("/api/export-pdf")
async def export_pdf(body: ExportPdfRequest, current_user: dict = Depends(get_current_user)):
    pdf_bytes = _build_pdf(body)
    filename = f"diet-plan-{_safe_text(body.patientData.get('name', 'export')).replace(' ', '_')}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
