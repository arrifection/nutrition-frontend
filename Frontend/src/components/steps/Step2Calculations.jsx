import DesktopStep2Calculations from "./desktop/Step2Calculations.jsx";
import MobileStep2Calculations from "./mobile/Step2Calculations.jsx";

export default function Step2Calculations(props) {
    return (
        <>
            <div className="dd-step-view dd-step-view--desktop">
                <DesktopStep2Calculations {...props} />
            </div>
            <div className="dd-step-view dd-step-view--mobile">
                <MobileStep2Calculations {...props} />
            </div>
        </>
    );
}
