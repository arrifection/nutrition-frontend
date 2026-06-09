import { useState, useRef } from "react";
import { Button, CircularProgress, LinearProgress, Snackbar, Alert } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { exportDietPlanPdf, getPdfDownloadName } from "../../services/pdfExport";

export default function PdfExportButton({
    exportPayload,
    beforeExport,
    className = "",
    wrapperClassName = "",
    disabled = false,
    variant = "outlined",
    fullWidth = false,
}) {
    const [exporting, setExporting] = useState(false);
    const [slowHint, setSlowHint] = useState(false);
    const [wakeHint, setWakeHint] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
    const timersRef = useRef([]);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const handleExport = async () => {
        if (exporting || disabled) return;

        if (beforeExport) {
            const allowed = await beforeExport();
            if (!allowed) return;
        }

        setExporting(true);
        setSlowHint(false);
        setWakeHint(false);
        clearTimers();

        timersRef.current.push(setTimeout(() => setSlowHint(true), 2000));
        timersRef.current.push(setTimeout(() => setWakeHint(true), 8000));

        try {
            const blob = await exportDietPlanPdf(exportPayload);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = getPdfDownloadName();
            a.click();
            URL.revokeObjectURL(url);
            setSnackbar({ open: true, message: "PDF downloaded successfully!", severity: "success" });
        } catch {
            setSnackbar({
                open: true,
                message: "Export failed. Please try again — the server may be waking up.",
                severity: "error",
            });
        } finally {
            clearTimers();
            setExporting(false);
            setSlowHint(false);
            setWakeHint(false);
        }
    };

    return (
        <div className={`pdf-export-wrap${wrapperClassName ? ` ${wrapperClassName}` : ""}`}>
            <Button
                type="button"
                variant={variant}
                onClick={handleExport}
                disabled={exporting || disabled}
                fullWidth={fullWidth}
                className={className || undefined}
                startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
                sx={{
                    height: 40,
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    ...(variant === "contained" && {
                        background: "var(--brand-green)",
                        "&:hover": { background: "#15803d" },
                    }),
                }}
            >
                {exporting ? "Generating PDF…" : "Export PDF"}
            </Button>

            {exporting && slowHint && (
                <div className="pdf-export-status" role="status">
                    <p className="pdf-export-slow-hint">This may take a moment…</p>
                    <LinearProgress color="success" />
                    {wakeHint && (
                        <p className="pdf-export-wake-hint">Backend is waking up, almost there…</p>
                    )}
                </div>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
