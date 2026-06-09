const ACTIVITY_MULTIPLIERS = {
    sedentary: [1.2, "Sedentary — little or no exercise"],
    light: [1.375, "Light — exercise 1–3 days/week"],
    moderate: [1.55, "Moderate — exercise 3–5 days/week"],
    active: [1.725, "Active — exercise 6–7 days/week"],
    very_active: [1.9, "Very active — intense daily exercise or physical job"],
};

export function validateAssessmentInputs({ weight_kg, height_cm, age, gender }) {
    const g = (gender || "").toLowerCase().trim();
    if (!["male", "female"].includes(g)) {
        return "Gender must be male or female";
    }
    if (age < 1 || age > 120) return "Age must be between 1 and 120 years";
    if (weight_kg < 5 || weight_kg > 300) return "Weight must be between 5 and 300 kg";
    if (height_cm < 50 || height_cm > 250) return "Height must be between 50 and 250 cm";
    if (Number.isNaN(weight_kg) || Number.isNaN(height_cm) || Number.isNaN(age)) {
        return "Please enter valid numbers for age, height, and weight";
    }
    return null;
}

function bmiCategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

export function computeFullAssessment({
    weight_kg,
    height_cm,
    age,
    gender,
    activity_level = "sedentary",
    goal = "maintenance",
    protein_factor_g_per_kg = 1.0,
}) {
    const validationError = validateAssessmentInputs({ weight_kg, height_cm, age, gender });
    if (validationError) {
        throw new Error(validationError);
    }

    const g = gender.toLowerCase().trim();
    const height_m = height_cm / 100;
    const height_in = height_cm / 2.54;

    const bmi = weight_kg / (height_m ** 2);
    const bmiRounded = Math.round(bmi * 100) / 100;

    let msjBmr;
    let msjFormula;
    if (g === "male") {
        msjBmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
        msjFormula = "10×weight(kg) + 6.25×height(cm) − 5×age + 5";
    } else {
        msjBmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
        msjFormula = "10×weight(kg) + 6.25×height(cm) − 5×age − 161";
    }

    let hbBmr;
    let hbFormula;
    if (g === "male") {
        hbBmr = 88.362 + 13.397 * weight_kg + 4.799 * height_cm - 5.677 * age;
        hbFormula = "88.362 + 13.397×W + 4.799×H − 5.677×age";
    } else {
        hbBmr = 447.593 + 9.247 * weight_kg + 3.098 * height_cm - 4.330 * age;
        hbFormula = "447.593 + 9.247×W + 3.098×H − 4.330×age";
    }

    const inchesOver5ft = Math.max(0, height_in - 60);
    const ibw = g === "male" ? 50 + 2.3 * inchesOver5ft : 45.5 + 2.3 * inchesOver5ft;
    const ibwFormula = g === "male"
        ? "50 kg + 2.3 kg × (height(in) − 60)"
        : "45.5 kg + 2.3 kg × (height(in) − 60)";

    let adjWeight;
    let adjFormula;
    let adjNote;
    if (weight_kg > ibw) {
        adjWeight = ibw + 0.25 * (weight_kg - ibw);
        adjFormula = "IBW + 0.25 × (actual weight − IBW)";
        adjNote = "Used when actual weight exceeds IBW (common for obese patients).";
    } else {
        adjWeight = weight_kg;
        adjFormula = "Actual body weight (not above IBW)";
        adjNote = "Actual weight used because patient is at or below IBW.";
    }

    const weightForProtein = bmi >= 30 ? adjWeight : weight_kg;

    const activityKey = (activity_level || "sedentary").toLowerCase().trim();
    const [multiplier, activityLabel] = ACTIVITY_MULTIPLIERS[activityKey] || ACTIVITY_MULTIPLIERS.sedentary;
    const tdee = msjBmr * multiplier;

    const goalKey = (goal || "maintenance").toLowerCase().trim();
    let goalAdjust = 0;
    if (goalKey.includes("loss")) goalAdjust = -300;
    else if (goalKey.includes("gain")) goalAdjust = 300;
    const goalCalories = tdee + goalAdjust;

    let fluidMl;
    let fluidFormula;
    if (weight_kg <= 10) {
        fluidMl = weight_kg * 100;
        fluidFormula = "100 mL × weight(kg) [first 10 kg]";
    } else if (weight_kg <= 20) {
        fluidMl = 1000 + (weight_kg - 10) * 50;
        fluidFormula = "1000 mL + 50 mL × (weight − 10 kg)";
    } else {
        fluidMl = 1500 + (weight_kg - 20) * 20;
        fluidFormula = "1500 mL + 20 mL × (weight − 20 kg)";
    }
    const fluidMlPerKg = Math.round(weight_kg * 35);

    const proteinStandard = Math.round(weight_kg * 0.8 * 10) / 10;
    const proteinClinical = Math.round(weightForProtein * protein_factor_g_per_kg * 10) / 10;

    return {
        inputs: {
            weight_kg,
            height_cm,
            age,
            gender: g,
            activity_level,
            goal: goalKey,
            protein_factor_g_per_kg,
        },
        bmi: {
            value: bmiRounded,
            category: bmiCategory(bmi),
            formula: "BMI = weight(kg) ÷ height(m)²",
            breakdown: [
                `Height: ${height_cm} cm = ${Math.round(height_m * 1000) / 1000} m`,
                `Calculation: ${weight_kg} ÷ (${Math.round(height_m * 1000) / 1000})² = ${bmiRounded} kg/m²`,
            ],
        },
        bmr_mifflin_st_jeor: {
            value: Math.round(msjBmr * 10) / 10,
            unit: "kcal/day",
            formula: msjFormula,
            breakdown: [
                `10 × ${weight_kg} = ${10 * weight_kg}`,
                `6.25 × ${height_cm} = ${Math.round(6.25 * height_cm * 10) / 10}`,
                `5 × ${age} = ${5 * age}`,
                `Result: ${Math.round(msjBmr * 10) / 10} kcal/day`,
            ],
            primary: true,
        },
        bmr_harris_benedict: {
            value: Math.round(hbBmr * 10) / 10,
            unit: "kcal/day",
            formula: hbFormula,
            breakdown: [
                `Using weight ${weight_kg} kg, height ${height_cm} cm, age ${age}`,
                `Result: ${Math.round(hbBmr * 10) / 10} kcal/day`,
            ],
        },
        ibw: {
            value: Math.round(ibw * 10) / 10,
            unit: "kg",
            formula: ibwFormula,
            breakdown: [
                `Height: ${Math.round(height_cm * 10) / 10} cm = ${Math.round(height_in * 10) / 10} in`,
                `Inches over 5 ft (60 in): ${Math.round(inchesOver5ft * 10) / 10}`,
                `Result: ${Math.round(ibw * 10) / 10} kg`,
            ],
        },
        adjusted_body_weight: {
            value: Math.round(adjWeight * 10) / 10,
            unit: "kg",
            formula: adjFormula,
            note: adjNote,
            breakdown: [
                `IBW: ${Math.round(ibw * 10) / 10} kg`,
                `Actual weight: ${weight_kg} kg`,
                `Adjusted: ${Math.round(adjWeight * 10) / 10} kg`,
            ],
        },
        tdee: {
            value: Math.round(tdee),
            unit: "kcal/day",
            formula: "BMR (Mifflin-St Jeor) × activity factor",
            activity_multiplier: multiplier,
            activity_label: activityLabel,
            breakdown: [
                `BMR: ${Math.round(msjBmr * 10) / 10} kcal/day`,
                `× ${multiplier} (${activityLabel})`,
                `= ${Math.round(tdee)} kcal/day`,
            ],
        },
        goal_calories: {
            value: Math.round(goalCalories),
            unit: "kcal/day",
            goal: goalKey,
            adjustment: goalAdjust,
            breakdown: [
                `TDEE: ${Math.round(tdee)} kcal/day`,
                `Goal adjustment: ${goalAdjust >= 0 ? "+" : ""}${goalAdjust} kcal`,
                `Target: ${Math.round(goalCalories)} kcal/day`,
            ],
        },
        daily_fluid: {
            value: Math.round(fluidMl),
            unit: "mL/day",
            formula: fluidFormula,
            reference_ml_per_kg: fluidMlPerKg,
            note: "Holliday-Segar maintenance estimate; 35 mL/kg/day shown as clinical reference.",
            breakdown: [
                `Holliday-Segar: ${Math.round(fluidMl)} mL/day`,
                `Reference 35 mL/kg: ${fluidMlPerKg} mL/day`,
            ],
        },
        protein_requirement: {
            standard_g: proteinStandard,
            clinical_g: proteinClinical,
            unit: "g/day",
            formula_standard: "0.8 g/kg × actual body weight (RDA reference)",
            formula_clinical: `${protein_factor_g_per_kg} g/kg × weight for protein`,
            weight_used_kg: Math.round(weightForProtein * 10) / 10,
            note: `Clinical estimate uses ${protein_factor_g_per_kg} g/kg on ${bmi >= 30 ? "adjusted" : "actual"} body weight.`,
            breakdown: [
                `RDA reference: 0.8 × ${weight_kg} = ${proteinStandard} g/day`,
                `Clinical: ${protein_factor_g_per_kg} × ${Math.round(weightForProtein * 10) / 10} = ${proteinClinical} g/day`,
            ],
        },
        summary: {
            bmi: bmiRounded,
            bmr: Math.round(msjBmr),
            bmr_harris_benedict: Math.round(hbBmr),
            tdee: Math.round(tdee),
            goal_calories: Math.round(goalCalories),
            ibw_kg: Math.round(ibw * 10) / 10,
            adjusted_body_weight_kg: Math.round(adjWeight * 10) / 10,
            fluid_ml_per_day: Math.round(fluidMl),
            protein_g_per_day: proteinClinical,
            protein_standard_g_per_day: proteinStandard,
        },
    };
}

export function assessmentFromPatient(patient) {
    if (!patient) return null;
    if (patient.assessment) return patient.assessment;
    try {
        return computeFullAssessment({
            weight_kg: parseFloat(patient.weight),
            height_cm: parseFloat(patient.height),
            age: parseInt(patient.age, 10),
            gender: patient.gender,
            activity_level: patient.activity_level,
            goal: patient.goal,
        });
    } catch {
        return null;
    }
}

export const ASSESSMENT_SECTIONS = [
    { key: "bmi", title: "BMI", valueKey: "value", suffix: "kg/m²" },
    { key: "bmr_mifflin_st_jeor", title: "BMR (Mifflin-St Jeor)", valueKey: "value", suffix: "kcal/day" },
    { key: "bmr_harris_benedict", title: "BMR (Harris-Benedict)", valueKey: "value", suffix: "kcal/day" },
    { key: "ibw", title: "Ideal Body Weight (IBW)", valueKey: "value", suffix: "kg" },
    { key: "adjusted_body_weight", title: "Adjusted Body Weight", valueKey: "value", suffix: "kg" },
    { key: "tdee", title: "TDEE", valueKey: "value", suffix: "kcal/day" },
    { key: "goal_calories", title: "Goal Calories", valueKey: "value", suffix: "kcal/day" },
    { key: "daily_fluid", title: "Daily Fluid Requirement", valueKey: "value", suffix: "mL/day" },
];
