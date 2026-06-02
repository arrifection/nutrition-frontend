import { LinearProgress } from "@mui/material";

export default function StepProgressMobile({ currentStep, onStepClick }) {
    const steps = [
        { number: 1, title: "Patient", short: "1" },
        { number: 2, title: "Calc", short: "2" },
        { number: 3, title: "Macros", short: "3" },
        { number: 4, title: "Meals", short: "4" },
        { number: 5, title: "Review", short: "5" },
    ];

    const progress = (currentStep / steps.length) * 100;

    const getStepStatus = (stepNumber) => {
        if (stepNumber < currentStep) return "completed";
        if (stepNumber === currentStep) return "active";
        return "inactive";
    };

    return (
        <div className="stepper-container step-progress-wrap" role="navigation" aria-label="Plan creation steps">
            <p className="step-progress-mobile-count">Step {currentStep} of {steps.length}</p>
            <LinearProgress variant="determinate" value={progress} className="step-progress-mobile-bar" />
            {steps.map((step, index) => (
                <div key={step.number} className="step-progress-segment step-item">
                    <button
                        type="button"
                        onClick={() => step.number <= currentStep && onStepClick(step.number)}
                        disabled={step.number > currentStep}
                        className={`step-progress-node step-progress-node--${getStepStatus(step.number)}`}
                        aria-current={step.number === currentStep ? "step" : undefined}
                    >
                        <span className="step-progress-circle">
                            {getStepStatus(step.number) === "completed" ? "✓" : step.number}
                        </span>
                        <span className="step-progress-label">{step.title}</span>
                    </button>
                    {index < steps.length - 1 && (
                        <div
                            className={`step-progress-line step-progress-line--${step.number < currentStep ? "done" : "pending"}`}
                            aria-hidden="true"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
