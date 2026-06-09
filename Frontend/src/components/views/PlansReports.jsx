import { FileText } from "lucide-react";
import PlaceholderPage from "../ui/PlaceholderPage";

export default function PlansReports({ onCreatePlan }) {
    return (
        <PlaceholderPage
            title="Nutrition Protocols"
            description="Review all active and historically assigned nutrition plans across your practice. Saved plans from the wizard will appear here in a future update."
            icon={FileText}
            actionLabel="Create a diet plan"
            onAction={onCreatePlan}
        />
    );
}
