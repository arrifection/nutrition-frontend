import DesktopStep1PatientInfo from "./desktop/Step1PatientInfo.jsx";
import MobileStep1PatientInfo from "./mobile/Step1PatientInfo.jsx";

export default function Step1PatientInfo(props) {
    return (
        <>
            <div className="dd-step-view dd-step-view--desktop">
                <DesktopStep1PatientInfo {...props} />
            </div>
            <div className="dd-step-view dd-step-view--mobile">
                <MobileStep1PatientInfo {...props} />
            </div>
        </>
    );
}
