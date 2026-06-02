import { useState, useEffect } from "react";

const MACRO_META = [
    { key: "carbs", label: "Carbs", color: "carbs" },
    { key: "protein", label: "Protein", color: "protein" },
    { key: "fat", label: "Fat", color: "fat" },
];

export default function Step3MacroSetup({ tdee, initialMacros, onConfirm, onBack }) {
    const [calories, setCalories] = useState(initialMacros?.calories || tdee || 2000);
    const [ratios, setRatios] = useState({
        carbs: initialMacros ? Math.round((initialMacros.carbs * 4 / initialMacros.calories) * 100) : 40,
        protein: initialMacros ? Math.round((initialMacros.protein * 4 / initialMacros.calories) * 100) : 30,
        fat: initialMacros ? Math.round((initialMacros.fat * 9 / initialMacros.calories) * 100) : 30,
    });
    const [grams, setGrams] = useState({ carbs: 0, protein: 0, fat: 0 });

    useEffect(() => {
        if (tdee && !initialMacros) {
            setCalories(tdee);
        }
    }, [tdee, initialMacros]);

    useEffect(() => {
        const cGrams = Math.round((calories * (ratios.carbs / 100)) / 4);
        const pGrams = Math.round((calories * (ratios.protein / 100)) / 4);
        const fGrams = Math.round((calories * (ratios.fat / 100)) / 9);
        setGrams({ carbs: cGrams, protein: pGrams, fat: fGrams });
    }, [calories, ratios]);

    const handleRatioChange = (key, value) => {
        if (value === "") {
            setRatios((prev) => ({ ...prev, [key]: "" }));
            return;
        }
        const val = parseInt(value);
        if (!isNaN(val)) {
            setRatios((prev) => ({ ...prev, [key]: val }));
        }
    };

    const handleCaloriesChange = (value) => {
        if (value === "") {
            setCalories("");
            return;
        }
        const val = parseInt(value);
        if (!isNaN(val)) {
            setCalories(val);
        }
    };

    const getNumericValue = (val) => (val === "" ? 0 : val);
    const totalPercentage =
        getNumericValue(ratios.carbs) + getNumericValue(ratios.protein) + getNumericValue(ratios.fat);
    const isValid = totalPercentage === 100;

    const handleConfirm = () => {
        if (!isValid) return;
        onConfirm({
            calories: parseInt(calories) || 0,
            carbs: grams.carbs,
            protein: grams.protein,
            fat: grams.fat,
        });
    };

    return (
        <div className="section dd-plan-step dd-step3">
            <div className="dd-step-header">
                <h2 className="section-title">Macro Targets Setup</h2>
                <p className="text-sm text-gray-500">
                    Step 3 of 5 — Set calorie and macronutrient targets
                </p>
            </div>

            <div className="dd-macro-hero dd-form-group">
                <p className="dd-form-group-label">Daily calorie target</p>
                <div className="dd-macro-hero-input">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={calories}
                        onChange={(e) => handleCaloriesChange(e.target.value)}
                        className="form-input dd-macro-cal-input"
                        aria-label="Daily calories"
                    />
                    <span className="dd-macro-cal-unit">kcal / day</span>
                </div>
                {tdee ? (
                    <button
                        type="button"
                        onClick={() => setCalories(tdee)}
                        className="dd-macro-reset-btn"
                    >
                        Reset to TDEE ({tdee})
                    </button>
                ) : null}
                <div className="dd-grams-grid dd-macro-hero-grams">
                    {MACRO_META.map(({ key, label }) => (
                        <div key={key} className={`dd-gram-tile dd-gram-tile--${key}`}>
                            <span className="dd-gram-label">{label}</span>
                            <strong className="dd-gram-value">{grams[key]}g</strong>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dd-form-group dd-macro-split-panel">
                <div className="dd-macro-split-head">
                    <p className="dd-form-group-label">Macro split</p>
                    <span className={`dd-macro-total-badge ${isValid ? "is-valid" : "is-invalid"}`}>
                        {totalPercentage}% {isValid ? "✓" : "→ 100%"}
                    </span>
                </div>

                <div className="dd-macro-cards">
                    {MACRO_META.map(({ key, label, color }) => (
                        <div key={key} className={`dd-macro-card dd-macro-card--${color}`}>
                            <div className="dd-macro-card-top">
                                <span className="dd-macro-card-name">{label}</span>
                                <div className="dd-macro-pct-wrap">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={ratios[key]}
                                        onChange={(e) => handleRatioChange(key, e.target.value)}
                                        className="form-input dd-macro-pct-input"
                                        aria-label={`${label} percentage`}
                                    />
                                    <span>%</span>
                                </div>
                                <span className="dd-macro-card-grams">{grams[key]}g</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={getNumericValue(ratios[key])}
                                onChange={(e) => handleRatioChange(key, e.target.value)}
                                className="dd-macro-range"
                                aria-label={`${label} slider`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="step-actions flex justify-between pt-8 border-t border-emerald-100 mt-2">
                <button type="button" onClick={onBack} className="btn-secondary">
                    ← Back
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!isValid}
                    className="btn-primary"
                >
                    Confirm Macros →
                </button>
            </div>
        </div>
    );
}
