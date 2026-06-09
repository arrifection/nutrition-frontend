import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ASSESSMENT_SECTIONS } from "../utils/nutritionAssessment";

function MetricCard({ title, value, unit, category, formula, breakdown, note, highlight, extra }) {
    const [open, setOpen] = useState(false);

    return (
        <article className={`na-card ${highlight ? "na-card--highlight" : ""}`}>
            <div className="na-card__header">
                <div>
                    <h3 className="na-card__title">{title}</h3>
                    {category && <p className="na-card__category">{category}</p>}
                </div>
                <div className="na-card__value-wrap">
                    <span className="na-card__value">{value}</span>
                    {unit && <span className="na-card__unit">{unit}</span>}
                </div>
            </div>

            {extra}

            <p className="na-card__formula">{formula}</p>

            {note && <p className="na-card__note">{note}</p>}

            {breakdown?.length > 0 && (
                <div className="na-card__breakdown">
                    <button
                        type="button"
                        className="na-card__toggle"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                    >
                        {open ? "Hide breakdown" : "Show calculation breakdown"}
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {open && (
                        <ol className="na-card__steps">
                            {breakdown.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                    )}
                </div>
            )}
        </article>
    );
}

export default function NutritionAssessmentPanel({ assessment, compact = false }) {
    if (!assessment) return null;

    const { summary, protein_requirement: protein } = assessment;

    return (
        <div className={`na-panel ${compact ? "na-panel--compact" : ""}`}>
            <div className="na-summary-grid">
                <div className="na-summary-chip">
                    <span className="na-summary-chip__label">BMI</span>
                    <strong>{summary.bmi}</strong>
                </div>
                <div className="na-summary-chip">
                    <span className="na-summary-chip__label">BMR (MSJ)</span>
                    <strong>{summary.bmr}</strong>
                </div>
                <div className="na-summary-chip na-summary-chip--accent">
                    <span className="na-summary-chip__label">Goal kcal</span>
                    <strong>{summary.goal_calories}</strong>
                </div>
                <div className="na-summary-chip">
                    <span className="na-summary-chip__label">Protein</span>
                    <strong>{summary.protein_g_per_day} g</strong>
                </div>
                <div className="na-summary-chip">
                    <span className="na-summary-chip__label">Fluid</span>
                    <strong>{summary.fluid_ml_per_day} mL</strong>
                </div>
                <div className="na-summary-chip">
                    <span className="na-summary-chip__label">IBW</span>
                    <strong>{summary.ibw_kg} kg</strong>
                </div>
            </div>

            <div className="na-cards-grid">
                {ASSESSMENT_SECTIONS.map(({ key, title, valueKey, suffix }) => {
                    const section = assessment[key];
                    if (!section) return null;
                    return (
                        <MetricCard
                            key={key}
                            title={title}
                            value={section[valueKey]}
                            unit={section.unit || suffix}
                            category={section.category}
                            formula={section.formula}
                            breakdown={section.breakdown}
                            note={section.note}
                            highlight={key === "goal_calories"}
                        />
                    );
                })}

                <MetricCard
                    title="Protein Requirement"
                    value={protein.clinical_g}
                    unit="g/day (clinical)"
                    formula={protein.formula_clinical}
                    breakdown={protein.breakdown}
                    note={protein.note}
                    extra={
                        <p className="na-card__subvalue">
                            RDA reference: <strong>{protein.standard_g} g/day</strong>
                            {" · "}
                            Weight basis: {protein.weight_used_kg} kg
                        </p>
                    }
                />
            </div>
        </div>
    );
}
