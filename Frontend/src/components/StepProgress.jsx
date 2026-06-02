import StepProgressDesktop from "./StepProgressDesktop.jsx";
import StepProgressMobile from "./StepProgressMobile.jsx";

export default function StepProgress(props) {
    return (
        <>
            <div className="dd-step-view dd-step-view--desktop">
                <StepProgressDesktop {...props} />
            </div>
            <div className="dd-step-view dd-step-view--mobile">
                <StepProgressMobile {...props} />
            </div>
        </>
    );
}
