import { useEffect, useMemo, useRef, useState } from "react";
import { scanMealPlanAllergenConflicts } from "../utils/allergenScan";

export default function useAllergenExportGate(patientData, weekPlan) {
    const conflicts = useMemo(
        () => scanMealPlanAllergenConflicts(patientData, weekPlan),
        [patientData, weekPlan]
    );

    const [acknowledged, setAcknowledged] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const pendingActionRef = useRef(null);

    useEffect(() => {
        setAcknowledged(false);
    }, [patientData, weekPlan]);

    const runOrPrompt = (action) => {
        if (!conflicts.length || acknowledged) {
            action();
            return;
        }
        pendingActionRef.current = action;
        setModalOpen(true);
    };

    const handleAcknowledge = () => {
        setAcknowledged(true);
        setModalOpen(false);
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        action?.();
    };

    const handleCancel = () => {
        setModalOpen(false);
        pendingActionRef.current = null;
    };

    const beforeExport = () => new Promise((resolve) => {
        runOrPrompt(() => resolve(true));
    });

    const allergenSafetyNote = acknowledged && conflicts.length > 0
        ? "Allergen conflicts were reviewed and clinically acknowledged before plan export."
        : null;

    return {
        conflicts,
        hasConflicts: conflicts.length > 0,
        acknowledged,
        allergenSafetyNote,
        modalOpen,
        runOrPrompt,
        handleAcknowledge,
        handleCancel,
        beforeExport,
    };
}
