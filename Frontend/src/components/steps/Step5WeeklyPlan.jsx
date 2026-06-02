import { useState, useMemo } from "react";
import { savePlan } from "../../services/api";
import { generateDietPlanPDF, PDF_TEMPLATE_OPTIONS } from "../../utils/pdfGenerator";
import { useAuth } from "../../context/AuthContext";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const MEAL_KEYS = ["breakfast", "snack", "lunch", "dinner"];
const MEAL_LABELS = {
    breakfast: "Breakfast",
    snack: "Snack",
    lunch: "Lunch",
    dinner: "Dinner",
};

export default function Step5WeeklyPlan({
    weekPlan,
    macroTargets,
    patientId,
    patientData,
    onError,
    onSuccess,
    onBack,
    onStartOver,
}) {
    const { saveHistory, user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [dietaryFocus, setDietaryFocus] = useState("");
    const [selectedPdfTemplate, setSelectedPdfTemplate] = useState(PDF_TEMPLATE_OPTIONS[0].id);

    const targets = macroTargets || {
        carbs: 200,
        protein: 150,
        fat: 65,
        calories: 2000,
    };

    const getDayTotals = (day) => {
        const dayMeals = weekPlan[day] || {};
        return Object.values(dayMeals)
            .flat()
            .reduce(
                (acc, food) => ({
                    carbs: acc.carbs + (food.macros?.carbs_g ?? food.carbohydrates ?? 0),
                    protein: acc.protein + (food.macros?.protein_g ?? food.protein ?? 0),
                    fat: acc.fat + (food.macros?.fat_g ?? food.fat ?? 0),
                    calories: acc.calories + (food.macros?.calories ?? food.calories ?? 0),
                    count: acc.count + 1,
                }),
                { carbs: 0, protein: 0, fat: 0, calories: 0, count: 0 }
            );
    };

    const weeklyStats = useMemo(() => {
        let totalItems = 0;
        let daysWithMeals = 0;

        DAYS.forEach((day) => {
            const totals = getDayTotals(day);
            if (totals.count > 0) {
                totalItems += totals.count;
                daysWithMeals++;
            }
        });

        return { totalItems, daysWithMeals };
    }, [weekPlan]);

    const handleSave = async () => {
        if (!patientId) {
            onError?.("No patient selected. Please go back and create a patient first.");
            return;
        }

        setSaving(true);
        const response = await savePlan(patientId, { days: weekPlan });
        if (response.success) {
            onSuccess?.("Weekly meal plan saved successfully!");
            if (user) {
                saveHistory("Diet Plan Saved", { patient: patientData?.name }, { days: Object.keys(weekPlan).length });
            }
        } else {
            onError?.(response.error);
        }
        setSaving(false);
    };

    const handleGeneratePDF = () => {
        generateDietPlanPDF({
            patientData,
            macroTargets: targets,
            weekPlan,
            dietaryFocus,
            selectedDay: null,
            templateId: selectedPdfTemplate,
        });
    };

    const selectedDayMeals = weekPlan[selectedDay] || {};
    const selectedDayTotals = getDayTotals(selectedDay);

    return (
        <div className="section dd-plan-step dd-step5">
            <div className="dd-step-header step5-header">
                <div>
                    <h2 className="section-title">Weekly Plan Review</h2>
                    <p className="text-sm text-gray-500">
                        Step 5 of 5 — Review and export your plan
                    </p>
                </div>
                <div className="step5-header-actions dd-step5-desktop-actions">
                    <button type="button" onClick={handleGeneratePDF} className="btn-secondary">
                        Download PDF
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !patientId}
                        className="btn-success"
                    >
                        {saving ? "Saving..." : "Save Plan"}
                    </button>
                </div>
            </div>

            <div className="dd-step5-stats">
                <div className="data-box dd-step5-stat">
                    <div className="data-label">Days planned</div>
                    <div className="data-value">{weeklyStats.daysWithMeals}</div>
                </div>
                <div className="data-box dd-step5-stat">
                    <div className="data-label">Total items</div>
                    <div className="data-value">{weeklyStats.totalItems}</div>
                </div>
                <div className="data-box dd-step5-stat">
                    <div className="data-label">Daily target</div>
                    <div className="data-value">{targets.calories}</div>
                    <span className="dd-step5-stat-sub">kcal</span>
                </div>
                <div className="data-box dd-step5-stat">
                    <div className="data-label">Patient</div>
                    <div className="dd-step5-patient-name">{patientData?.name || "Not set"}</div>
                </div>
            </div>

            <div className="dd-form-group dd-step5-export">
                <p className="dd-form-group-label">Export options</p>
                <label className="form-label">PDF template</label>
                <select
                    value={selectedPdfTemplate}
                    onChange={(event) => setSelectedPdfTemplate(event.target.value)}
                    className="form-select"
                >
                    {PDF_TEMPLATE_OPTIONS.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
                <label className="form-label">Dietary focus (optional, for PDF)</label>
                <textarea
                    value={dietaryFocus}
                    onChange={(e) => setDietaryFocus(e.target.value)}
                    placeholder="e.g. Weight loss with moderate carb restriction..."
                    rows={2}
                    className="form-textarea"
                />
            </div>

            <div className="dd-form-group dd-step5-weekly">
                <p className="dd-form-group-label">Weekly overview</p>
                <div className="dd-day-tabs dd-step5-day-tabs">
                    {DAYS.map((day) => {
                        const totals = getDayTotals(day);
                        const isSelected = selectedDay === day;
                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                className={`dd-step5-day-pill ${isSelected ? "is-active" : ""} ${totals.count > 0 ? "has-data" : ""}`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        );
                    })}
                </div>

                <div className="dd-step5-weekly-cards">
                    {DAYS.map((day) => {
                        const totals = getDayTotals(day);
                        const isSelected = selectedDay === day;
                        const hasItems = totals.count > 0;
                        const overCalories = hasItems && totals.calories > targets.calories;

                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                className={`dd-step5-week-card ${isSelected ? "is-selected" : ""}`}
                            >
                                <div className="dd-step5-week-card-top">
                                    <strong>{day}</strong>
                                    <span>{hasItems ? `${totals.count} items` : "Empty"}</span>
                                </div>
                                <div className="dd-step5-week-card-macros">
                                    <span className={overCalories ? "text-red-600" : ""}>
                                        {hasItems ? `${Math.round(totals.calories)} kcal` : "—"}
                                    </span>
                                    <span>C {hasItems ? `${Math.round(totals.carbs)}g` : "—"}</span>
                                    <span>P {hasItems ? `${Math.round(totals.protein)}g` : "—"}</span>
                                    <span>F {hasItems ? `${Math.round(totals.fat)}g` : "—"}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="dd-step5-table-wrap dd-table-scroll overflow-x-auto">
                    <table className="w-full border-collapse border border-emerald-200">
                        <thead>
                            <tr className="bg-emerald-50">
                                <th className="text-left text-xs font-medium text-gray-600 uppercase py-3 px-4 border-b border-emerald-200">Day</th>
                                <th className="text-center text-xs font-medium text-gray-600 uppercase py-3 px-4 border-b border-emerald-200">Items</th>
                                <th className="text-center text-xs font-medium text-gray-600 uppercase py-3 px-4 border-b border-emerald-200">Cal</th>
                                <th className="text-center text-xs font-medium text-gray-600 uppercase py-3 px-4 border-b border-emerald-200">C</th>
                                <th className="text-center text-xs font-medium text-gray-600 uppercase py-3 px-4 border-b border-emerald-200">P</th>
                                <th className="text-center text-xs font-medium text-gray-600 uppercase py-3 px-4 border-b border-emerald-200">F</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((day) => {
                                const totals = getDayTotals(day);
                                const isSelected = selectedDay === day;
                                const hasItems = totals.count > 0;

                                return (
                                    <tr
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`cursor-pointer transition-colors border-b border-emerald-100 ${isSelected ? "bg-emerald-100" : "hover:bg-emerald-50"}`}
                                    >
                                        <td className="py-3 px-4 text-sm font-medium text-gray-800">{day}</td>
                                        <td className="py-3 px-4 text-sm text-center text-gray-600">{totals.count}</td>
                                        <td className={`py-3 px-4 text-sm text-center font-medium ${hasItems ? (totals.calories > targets.calories ? "text-red-600" : "text-gray-800") : "text-gray-300"}`}>
                                            {hasItems ? Math.round(totals.calories) : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-center text-gray-600">{hasItems ? `${Math.round(totals.carbs)}g` : "—"}</td>
                                        <td className="py-3 px-4 text-sm text-center text-gray-600">{hasItems ? `${Math.round(totals.protein)}g` : "—"}</td>
                                        <td className="py-3 px-4 text-sm text-center text-gray-600">{hasItems ? `${Math.round(totals.fat)}g` : "—"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="dd-form-group dd-step5-day-detail">
                <div className="dd-step5-day-detail-head">
                    <p className="dd-form-group-label">{selectedDay}</p>
                    <span className="dd-step5-day-meta">
                        {selectedDayTotals.count} items · {Math.round(selectedDayTotals.calories)} kcal
                    </span>
                </div>
                <div className="dd-step5-meals-grid">
                    {MEAL_KEYS.map((mealKey) => {
                        const items = selectedDayMeals[mealKey] || [];
                        return (
                            <div key={mealKey} className="dd-step5-meal-card">
                                <h4 className="dd-step5-meal-title">{MEAL_LABELS[mealKey]}</h4>
                                {items.length > 0 ? (
                                    <ul className="dd-step5-meal-list">
                                        {items.map((food) => (
                                            <li key={food.instanceId || food.id || food.name}>
                                                <span className="truncate">{food.food_name?.en || food.name}</span>
                                                <em>{food.macros?.calories || food.calories}</em>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="dd-step5-meal-empty">No items</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="step-actions dd-step5-actions flex justify-between pt-6 border-t border-emerald-100">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !patientId}
                    className="btn-success dd-step5-mobile-action"
                >
                    {saving ? "Saving..." : "Save Plan"}
                </button>
                <button type="button" onClick={handleGeneratePDF} className="btn-secondary dd-step5-mobile-action">
                    Download PDF
                </button>
                <button type="button" onClick={onBack} className="btn-secondary">
                    ← Back to Planner
                </button>
                <button type="button" onClick={onStartOver} className="btn-secondary">
                    Start New Plan
                </button>
            </div>
        </div>
    );
}
