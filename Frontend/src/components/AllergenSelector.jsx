import { useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import { STANDARD_ALLERGENS, normalizeAllergens } from "../constants/allergens";

export default function AllergenSelector({ value, onChange, disabled = false }) {
    const allergens = normalizeAllergens(value);
    const [customInput, setCustomInput] = useState("");

    const update = (patch) => onChange({ ...allergens, ...patch });

    const toggle = (key) => {
        update({ [key]: !allergens[key] });
    };

    const addCustom = () => {
        const trimmed = customInput.trim();
        if (!trimmed) return;
        const exists = allergens.custom.some(
            (c) => c.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) {
            setCustomInput("");
            return;
        }
        update({ custom: [...allergens.custom, trimmed] });
        setCustomInput("");
    };

    const removeCustom = (item) => {
        update({ custom: allergens.custom.filter((c) => c !== item) });
    };

    const hasAny = STANDARD_ALLERGENS.some(({ key }) => allergens[key]) || allergens.custom.length > 0;

    return (
        <div className="allergen-selector">
            <div className="allergen-selector__header">
                <label className="form-label">Allergen Profile</label>
                <p className="allergen-selector__hint">
                    Select known allergens. Diet plans will be scanned before export.
                </p>
            </div>

            <div className="allergen-selector__grid">
                {STANDARD_ALLERGENS.map(({ key, label }) => (
                    <label key={key} className={`allergen-chip ${allergens[key] ? "allergen-chip--active" : ""}`}>
                        <input
                            type="checkbox"
                            checked={Boolean(allergens[key])}
                            onChange={() => toggle(key)}
                            disabled={disabled}
                        />
                        <span>{label}</span>
                    </label>
                ))}
            </div>

            <div className="allergen-selector__custom">
                <label className="form-label">Custom allergens</label>
                <div className="allergen-selector__custom-row">
                    <input
                        type="text"
                        className="form-input"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                        placeholder="e.g. Sesame, Sulphites"
                        disabled={disabled}
                    />
                    <button type="button" className="btn-secondary" onClick={addCustom} disabled={disabled}>
                        <Plus size={16} /> Add
                    </button>
                </div>
                {allergens.custom.length > 0 && (
                    <div className="allergen-selector__custom-list">
                        {allergens.custom.map((item) => (
                            <span key={item} className="allergen-custom-tag">
                                {item}
                                {!disabled && (
                                    <button type="button" onClick={() => removeCustom(item)} aria-label={`Remove ${item}`}>
                                        <X size={14} />
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {hasAny && (
                <div className="allergen-selector__notice">
                    <AlertTriangle size={16} aria-hidden />
                    <span>Allergen checks will run when saving or exporting meal plans.</span>
                </div>
            )}
        </div>
    );
}
