import { useMemo } from "react";
import { Calculator } from "lucide-react";
import NutritionAssessmentPanel from "../../NutritionAssessmentPanel";
import EmptyState from "../../ui/EmptyState";
import { assessmentFromPatient } from "../../../utils/nutritionAssessment";

export default function Step2Calculations({ metrics, patientData, onProceed, onBack }) {
    const assessment = useMemo(() => {
        if (metrics?.assessment) return metrics.assessment;
        return assessmentFromPatient(patientData);
    }, [metrics, patientData]);

    if (!metrics && !assessment) {
        return (
            <div className="section">
                <EmptyState
                    icon={Calculator}
                    title="No assessment data yet"
                    description="Complete patient information in Step 1 to generate clinical calculations and formula breakdowns."
                    actionLabel="Go back to patient info"
                    onAction={onBack}
                />
            </div>
        );
    }

    return (
        <div className="section">
            <div className="mb-8">
                <h2 className="section-title">Nutrition Assessment</h2>
                <p className="text-sm text-gray-500">
                    Step 2 of 5 — Review clinical calculations and formulas
                </p>
            </div>

            <NutritionAssessmentPanel assessment={assessment} />

            <div className="flex justify-between pt-6 mt-6 border-t border-emerald-100 na-step-actions">
                <button onClick={onBack} className="btn-secondary">
                    ← Back
                </button>
                <button onClick={onProceed} className="btn-primary">
                    Export to Macro Setup →
                </button>
            </div>
        </div>
    );
}
