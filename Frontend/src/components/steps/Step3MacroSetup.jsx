import DesktopStep3MacroSetup from "./desktop/Step3MacroSetup.jsx";
import MobileStep3MacroSetup from "./mobile/Step3MacroSetup.jsx";

export default function Step3MacroSetup(props) {
    return (
        <>
            <div className="dd-step-view dd-step-view--desktop">
                <DesktopStep3MacroSetup {...props} />
            </div>
            <div className="dd-step-view dd-step-view--mobile">
                <MobileStep3MacroSetup {...props} />
            </div>
        </>
    );
}
