import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function AllergenWarningModal({ open, conflicts, onCancel, onAcknowledge }) {
    const [checked, setChecked] = useState(false);

    if (!open) return null;

    const handleClose = () => {
        setChecked(false);
        onCancel?.();
    };

    const handleProceed = () => {
        if (!checked) return;
        setChecked(false);
        onAcknowledge?.();
    };

    return (
        <div className="allergen-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="allergen-modal-title">
            <div className="allergen-modal">
                <div className="allergen-modal__header">
                    <div className="allergen-modal__title-wrap">
                        <AlertTriangle size={22} className="allergen-modal__icon" aria-hidden />
                        <h2 id="allergen-modal-title">Allergen conflict detected</h2>
                    </div>
                    <button type="button" className="allergen-modal__close" onClick={handleClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <p className="allergen-modal__intro">
                    This meal plan includes foods that may conflict with the patient&apos;s allergen profile.
                    Review each item before continuing.
                </p>

                <ul className="allergen-modal__list">
                    {conflicts.map((conflict, index) => (
                        <li key={`${conflict.day}-${conflict.meal}-${conflict.food_name}-${conflict.allergen}-${index}`}>
                            <strong>{conflict.food_name}</strong>
                            <span>{conflict.day} · {conflict.meal}</span>
                            <em>{conflict.allergen_label || conflict.allergen}</em>
                        </li>
                    ))}
                </ul>

                <label className="allergen-modal__ack">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                    <span>
                        I have reviewed these allergen conflicts and accept clinical responsibility to proceed.
                    </span>
                </label>

                <div className="allergen-modal__actions">
                    <button type="button" className="btn-secondary" onClick={handleClose}>
                        Go back and edit plan
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleProceed}
                        disabled={!checked}
                    >
                        Acknowledge and continue
                    </button>
                </div>
            </div>
        </div>
    );
}
