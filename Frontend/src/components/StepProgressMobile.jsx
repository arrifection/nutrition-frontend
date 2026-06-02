import { LinearProgress } from "@mui/material";

export default function StepProgressMobile({ currentStep, onStepClick }) {
    const steps = [
        { number: 1, title: "Patient" },
        { number: 2, title: "Calc" },
        { number: 3, title: "Macros" },
        { number: 4, title: "Meals" },
        { number: 5, title: "Review" },
    ];

    const progress = (currentStep / steps.length) * 100;

    const getStepStatus = (stepNumber) => {
        if (stepNumber < currentStep) return "completed";
        if (stepNumber === currentStep) return "active";
        return "inactive";
    };

    return (
        <div className="mobile-stepper" role="navigation" aria-label="Plan creation steps">
            <div className="mobile-stepper-head">
                <span className="mobile-stepper-count">
                    Step {currentStep} of {steps.length}
                </span>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    className="mobile-stepper-bar"
                    color="success"
                />
            </div>
            <div className="mobile-stepper-chips">
                {steps.map((step) => {
                    const status = getStepStatus(step.number);
                    return (
                        <button
                            key={step.number}
                            type="button"
                            onClick={() => step.number <= currentStep && onStepClick(step.number)}
                            disabled={step.number > currentStep}
                            className={`mobile-stepper-chip mobile-stepper-chip--${status}`}
                            aria-current={step.number === currentStep ? "step" : undefined}
                        >
                            <span className="mobile-stepper-chip-num">
                                {status === "completed" ? "✓" : step.number}
                            </span>
                            <span className="mobile-stepper-chip-label">{step.title}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
