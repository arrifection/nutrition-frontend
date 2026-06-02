import { useState } from "react";
import { exportDietPlanPdf, getPdfDownloadName } from "../../services/pdfExport";

export default function PdfExportButton({
    exportPayload,
    onError,
    className = "btn-secondary",
    wrapperClassName = "",
    disabled = false,
}) {
    const [exporting, setExporting] = useState(false);
    const [slowHint, setSlowHint] = useState(false);

    const handleExport = async () => {
        if (exporting || disabled) return;

        setExporting(true);
        setSlowHint(false);
        const slowTimer = setTimeout(() => setSlowHint(true), 3000);

        try {
            const blob = await exportDietPlanPdf(exportPayload);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = getPdfDownloadName();
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            onError?.("Export failed. Please try again.");
        } finally {
            clearTimeout(slowTimer);
            setExporting(false);
            setSlowHint(false);
        }
    };

    return (
        <div className={`pdf-export-wrap${wrapperClassName ? ` ${wrapperClassName}` : ""}`}>
            <button
                type="button"
                onClick={handleExport}
                disabled={exporting || disabled}
                className={className}
            >
                {exporting ? "Generating PDF..." : "Export PDF"}
            </button>
            {exporting && slowHint && (
                <p className="pdf-export-slow-hint" role="status">
                    This may take a moment...
                </p>
            )}
        </div>
    );
}
