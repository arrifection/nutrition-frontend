import { AlertTriangle, X } from "lucide-react";

export default function AllergenAddFoodModal({
    open,
    foodName,
    conflicts,
    patientAllergies,
    onCancel,
    onConfirm,
}) {
    if (!open) return null;

    return (
        <div className="allergen-modal-backdrop" role="dialog" aria-modal="true">
            <div className="allergen-modal">
                <div className="allergen-modal__header">
                    <div className="allergen-modal__title-wrap">
                        <AlertTriangle size={22} className="allergen-modal__icon" aria-hidden />
                        <h2>Allergen warning</h2>
                    </div>
                    <button type="button" className="allergen-modal__close" onClick={onCancel} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <p className="allergen-modal__intro">
                    <strong>{foodName}</strong> may conflict with this patient&apos;s allergies
                    {patientAllergies ? ` (${patientAllergies})` : ""}.
                </p>

                <ul className="allergen-modal__list">
                    {conflicts.map((conflict, index) => (
                        <li key={`${conflict.allergen}-${index}`}>
                            <strong>{conflict.allergen_label}</strong>
                            <span>{conflict.message}</span>
                        </li>
                    ))}
                </ul>

                <div className="allergen-modal__actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary" onClick={onConfirm}>
                        Add anyway
                    </button>
                </div>
            </div>
        </div>
    );
}
