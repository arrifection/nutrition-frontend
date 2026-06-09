import { useState } from "react";
import NutritionAssessmentPanel from "../components/NutritionAssessmentPanel";
import { calculateAssessment } from "../services/api";
import { computeFullAssessment, validateAssessmentInputs } from "../utils/nutritionAssessment";

const ACTIVITY_LEVELS = [
    { value: "sedentary", label: "Sedentary" },
    { value: "light", label: "Light" },
    { value: "moderate", label: "Moderate" },
    { value: "active", label: "Active" },
    { value: "very_active", label: "Very Active" },
];

const GOALS = [
    { value: "maintenance", label: "Maintenance" },
    { value: "weight loss", label: "Weight Loss" },
    { value: "weight gain", label: "Weight Gain" },
];

export default function NutritionCalculators({ onExportToPlan }) {
    const [form, setForm] = useState({
        weight_kg: "",
        height_cm: "",
        age: "",
        gender: "female",
        activity_level: "sedentary",
        goal: "maintenance",
        protein_factor_g_per_kg: "1.0",
    });
    const [assessment, setAssessment] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const runAssessment = async (e) => {
        e?.preventDefault();
        setError("");

        const payload = {
            weight_kg: parseFloat(form.weight_kg),
            height_cm: parseFloat(form.height_cm),
            age: parseInt(form.age, 10),
            gender: form.gender,
            activity_level: form.activity_level,
            goal: form.goal,
            protein_factor_g_per_kg: parseFloat(form.protein_factor_g_per_kg) || 1.0,
        };

        const validationError = validateAssessmentInputs(payload);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        const local = computeFullAssessment(payload);
        setAssessment(local);

        const apiResult = await calculateAssessment(payload);
        if (apiResult.success) {
            setAssessment(apiResult.data);
        }

        setLoading(false);
    };

    const handleExport = () => {
        if (!assessment) return;
        onExportToPlan?.({
            assessment,
            metrics: {
                bmi: assessment.summary.bmi,
                bmr: assessment.summary.bmr,
                tdee: assessment.summary.goal_calories,
                assessment,
            },
        });
    };

    return (
        <div className="na-page dd-mobile-page">
            <header className="na-page__header na-section-block">
                <h1 className="section-title">Nutrition Assessment</h1>
                <p className="text-sm text-gray-500">
                    Clinical calculators with formula transparency for dietetic practice.
                </p>
            </header>

            <section className="na-section-block na-section-block--alt">
            <form className="na-form" onSubmit={runAssessment}>
                <div className="na-form__grid">
                    <div>
                        <label className="form-label">Weight (kg)</label>
                        <input
                            className="form-input"
                            type="number"
                            name="weight_kg"
                            value={form.weight_kg}
                            onChange={handleChange}
                            min="20"
                            max="300"
                            step="0.1"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Height (cm)</label>
                        <input
                            className="form-input"
                            type="number"
                            name="height_cm"
                            value={form.height_cm}
                            onChange={handleChange}
                            min="100"
                            max="250"
                            step="0.1"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Age (years)</label>
                        <input
                            className="form-input"
                            type="number"
                            name="age"
                            value={form.age}
                            onChange={handleChange}
                            min="1"
                            max="120"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label">Gender</label>
                        <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Activity Level</label>
                        <select
                            className="form-select"
                            name="activity_level"
                            value={form.activity_level}
                            onChange={handleChange}
                        >
                            {ACTIVITY_LEVELS.map((l) => (
                                <option key={l.value} value={l.value}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Goal</label>
                        <select className="form-select" name="goal" value={form.goal} onChange={handleChange}>
                            {GOALS.map((g) => (
                                <option key={g.value} value={g.value}>
                                    {g.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Protein factor (g/kg)</label>
                        <input
                            className="form-input"
                            type="number"
                            name="protein_factor_g_per_kg"
                            value={form.protein_factor_g_per_kg}
                            onChange={handleChange}
                            min="0.6"
                            max="2.5"
                            step="0.1"
                        />
                    </div>
                </div>

                {error && <p className="na-form__error" role="alert">{error}</p>}

                <div className="na-form__actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Calculating…" : "Calculate Assessment"}
                    </button>
                </div>
            </form>
            </section>

            {assessment && (
                <section className="na-section-block na-results-section">
                    <div className="na-results-section__toolbar">
                        <button type="button" className="btn-secondary" onClick={handleExport}>
                            Export to Diet Plan →
                        </button>
                    </div>
                    <NutritionAssessmentPanel assessment={assessment} />
                </section>
            )}
        </div>
    );
}
