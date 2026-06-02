import DesktopStep4MealPlanner from "./desktop/Step4MealPlanner.jsx";
import MobileStep4MealPlanner from "./mobile/Step4MealPlanner.jsx";

export default function Step4MealPlanner(props) {
    return (
        <>
            <div className="dd-step-view dd-step-view--desktop">
                <DesktopStep4MealPlanner {...props} />
            </div>
            <div className="dd-step-view dd-step-view--mobile">
                <MobileStep4MealPlanner {...props} />
            </div>
        </>
    );
}
