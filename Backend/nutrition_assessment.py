"""Clinical nutrition assessment calculations with formula breakdowns."""

from typing import Any, Optional


class AssessmentValidationError(ValueError):
    pass


def _validate_inputs(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
) -> str:
    g = gender.lower().strip()
    if g not in ("male", "female"):
        raise AssessmentValidationError("Gender must be 'male' or 'female'")
    if age < 1 or age > 120:
        raise AssessmentValidationError("Age must be between 1 and 120 years")
    if weight_kg < 20 or weight_kg > 300:
        raise AssessmentValidationError("Weight must be between 20 and 300 kg")
    if height_cm < 100 or height_cm > 250:
        raise AssessmentValidationError("Height must be between 100 and 250 cm")
    return g


def _bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Normal weight"
    if bmi < 30:
        return "Overweight"
    return "Obese"


def _activity_multiplier(activity_level: str) -> tuple[float, str]:
    multipliers = {
        "sedentary": (1.2, "Sedentary — little or no exercise"),
        "light": (1.375, "Light — exercise 1–3 days/week"),
        "moderate": (1.55, "Moderate — exercise 3–5 days/week"),
        "active": (1.725, "Active — exercise 6–7 days/week"),
        "very_active": (1.9, "Very active — intense daily exercise or physical job"),
    }
    key = (activity_level or "sedentary").lower().strip()
    return multipliers.get(key, multipliers["sedentary"])


def compute_full_assessment(
    *,
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str = "sedentary",
    goal: str = "maintenance",
    protein_factor_g_per_kg: float = 1.0,
) -> dict[str, Any]:
    g = _validate_inputs(weight_kg, height_cm, age, gender)

    height_m = height_cm / 100
    height_in = height_cm / 2.54

    # BMI
    bmi = weight_kg / (height_m ** 2)
    bmi_rounded = round(bmi, 2)

    # Mifflin-St Jeor BMR
    if g == "male":
        msj_bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
        msj_formula = "10×weight(kg) + 6.25×height(cm) − 5×age + 5"
    else:
        msj_bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
        msj_formula = "10×weight(kg) + 6.25×height(cm) − 5×age − 161"

    # Harris-Benedict (revised, metric)
    if g == "male":
        hb_bmr = 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
        hb_formula = "88.362 + 13.397×W + 4.799×H − 5.677×age"
    else:
        hb_bmr = 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)
        hb_formula = "447.593 + 9.247×W + 3.098×H − 4.330×age"

    # IBW — Devine formula (kg)
    inches_over_5ft = max(0, height_in - 60)
    if g == "male":
        ibw = 50 + (2.3 * inches_over_5ft)
        ibw_formula = "50 kg + 2.3 kg × (height(in) − 60)"
    else:
        ibw = 45.5 + (2.3 * inches_over_5ft)
        ibw_formula = "45.5 kg + 2.3 kg × (height(in) − 60)"

    # Adjusted body weight (when actual weight > IBW)
    if weight_kg > ibw:
        adj_weight = ibw + 0.25 * (weight_kg - ibw)
        adj_formula = "IBW + 0.25 × (actual weight − IBW)"
        adj_note = "Used when actual weight exceeds IBW (common for obese patients)."
    else:
        adj_weight = weight_kg
        adj_formula = "Actual body weight (not above IBW)"
        adj_note = "Actual weight used because patient is at or below IBW."

    weight_for_protein = adj_weight if bmi >= 30 else weight_kg

    # TDEE from Mifflin-St Jeor (primary)
    multiplier, activity_label = _activity_multiplier(activity_level)
    tdee = msj_bmr * multiplier
    goal_key = (goal or "maintenance").lower().strip()
    goal_adjust = 0
    if "loss" in goal_key:
        goal_adjust = -300
    elif "gain" in goal_key:
        goal_adjust = 300
    goal_calories = tdee + goal_adjust

    # Fluid — Holliday-Segar (adult simplified) + mL/kg reference
    if weight_kg <= 10:
        fluid_ml = weight_kg * 100
        fluid_formula = "100 mL × weight(kg) [first 10 kg]"
    elif weight_kg <= 20:
        fluid_ml = 1000 + (weight_kg - 10) * 50
        fluid_formula = "1000 mL + 50 mL × (weight − 10 kg)"
    else:
        fluid_ml = 1500 + (weight_kg - 20) * 20
        fluid_formula = "1500 mL + 20 mL × (weight − 20 kg)"
    fluid_ml_per_kg = round(weight_kg * 35)
    fluid_note = "Holliday-Segar maintenance estimate; 35 mL/kg/day shown as clinical reference."

    # Protein
    protein_standard = round(weight_kg * 0.8, 1)
    protein_clinical = round(weight_for_protein * protein_factor_g_per_kg, 1)
    protein_note = (
        f"Clinical estimate uses {protein_factor_g_per_kg} g/kg on "
        f"{'adjusted' if bmi >= 30 else 'actual'} body weight."
    )

    return {
        "inputs": {
            "weight_kg": weight_kg,
            "height_cm": height_cm,
            "age": age,
            "gender": g,
            "activity_level": activity_level,
            "goal": goal_key,
            "protein_factor_g_per_kg": protein_factor_g_per_kg,
        },
        "bmi": {
            "value": bmi_rounded,
            "category": _bmi_category(bmi),
            "formula": "BMI = weight(kg) ÷ height(m)²",
            "breakdown": [
                f"Height: {height_cm} cm = {round(height_m, 3)} m",
                f"Calculation: {weight_kg} ÷ ({round(height_m, 3)})² = {bmi_rounded} kg/m²",
            ],
        },
        "bmr_mifflin_st_jeor": {
            "value": round(msj_bmr, 1),
            "unit": "kcal/day",
            "formula": msj_formula,
            "breakdown": [
                f"10 × {weight_kg} = {10 * weight_kg}",
                f"6.25 × {height_cm} = {round(6.25 * height_cm, 1)}",
                f"5 × {age} = {5 * age}",
                f"Result: {round(msj_bmr, 1)} kcal/day",
            ],
            "primary": True,
        },
        "bmr_harris_benedict": {
            "value": round(hb_bmr, 1),
            "unit": "kcal/day",
            "formula": hb_formula,
            "breakdown": [
                f"Using weight {weight_kg} kg, height {height_cm} cm, age {age}",
                f"Result: {round(hb_bmr, 1)} kcal/day",
            ],
        },
        "ibw": {
            "value": round(ibw, 1),
            "unit": "kg",
            "formula": ibw_formula,
            "breakdown": [
                f"Height: {round(height_cm, 1)} cm = {round(height_in, 1)} in",
                f"Inches over 5 ft (60 in): {round(inches_over_5ft, 1)}",
                f"Result: {round(ibw, 1)} kg",
            ],
        },
        "adjusted_body_weight": {
            "value": round(adj_weight, 1),
            "unit": "kg",
            "formula": adj_formula,
            "note": adj_note,
            "breakdown": [
                f"IBW: {round(ibw, 1)} kg",
                f"Actual weight: {weight_kg} kg",
                f"Adjusted: {round(adj_weight, 1)} kg",
            ],
        },
        "tdee": {
            "value": round(tdee, 0),
            "unit": "kcal/day",
            "formula": "BMR (Mifflin-St Jeor) × activity factor",
            "activity_multiplier": multiplier,
            "activity_label": activity_label,
            "breakdown": [
                f"BMR: {round(msj_bmr, 1)} kcal/day",
                f"× {multiplier} ({activity_label})",
                f"= {round(tdee, 0)} kcal/day",
            ],
        },
        "goal_calories": {
            "value": round(goal_calories, 0),
            "unit": "kcal/day",
            "goal": goal_key,
            "adjustment": goal_adjust,
            "breakdown": [
                f"TDEE: {round(tdee, 0)} kcal/day",
                f"Goal adjustment: {goal_adjust:+d} kcal",
                f"Target: {round(goal_calories, 0)} kcal/day",
            ],
        },
        "daily_fluid": {
            "value": round(fluid_ml, 0),
            "unit": "mL/day",
            "formula": fluid_formula,
            "reference_ml_per_kg": fluid_ml_per_kg,
            "note": fluid_note,
            "breakdown": [
                f"Holliday-Segar: {round(fluid_ml, 0)} mL/day",
                f"Reference 35 mL/kg: {fluid_ml_per_kg} mL/day",
            ],
        },
        "protein_requirement": {
            "standard_g": protein_standard,
            "clinical_g": protein_clinical,
            "unit": "g/day",
            "formula_standard": "0.8 g/kg × actual body weight (RDA reference)",
            "formula_clinical": f"{protein_factor_g_per_kg} g/kg × weight for protein",
            "weight_used_kg": round(weight_for_protein, 1),
            "note": protein_note,
            "breakdown": [
                f"RDA reference: 0.8 × {weight_kg} = {protein_standard} g/day",
                f"Clinical: {protein_factor_g_per_kg} × {round(weight_for_protein, 1)} = {protein_clinical} g/day",
            ],
        },
        # Flat summary for patient/plan export
        "summary": {
            "bmi": bmi_rounded,
            "bmr": round(msj_bmr, 0),
            "bmr_harris_benedict": round(hb_bmr, 0),
            "tdee": round(tdee, 0),
            "goal_calories": round(goal_calories, 0),
            "ibw_kg": round(ibw, 1),
            "adjusted_body_weight_kg": round(adj_weight, 1),
            "fluid_ml_per_day": round(fluid_ml, 0),
            "protein_g_per_day": protein_clinical,
            "protein_standard_g_per_day": protein_standard,
        },
    }
