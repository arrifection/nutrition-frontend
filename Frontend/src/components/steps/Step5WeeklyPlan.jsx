import DesktopStep5WeeklyPlan from "./desktop/Step5WeeklyPlan.jsx";
import MobileStep5WeeklyPlan from "./mobile/Step5WeeklyPlan.jsx";

export default function Step5WeeklyPlan(props) {
    return (
        <>
            <div className="dd-step-view dd-step-view--desktop">
                <DesktopStep5WeeklyPlan {...props} />
            </div>
            <div className="dd-step-view dd-step-view--mobile">
                <MobileStep5WeeklyPlan {...props} />
            </div>
        </>
    );
}
