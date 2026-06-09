import { useEffect, useState } from "react";
import { Box } from "@mui/material";

export default function RouteLoadingFallback({ minHeight = "40vh" }) {
    const [waking, setWaking] = useState(false);

    useEffect(() => {
        const onWaking = () => setWaking(true);
        window.addEventListener("dietdesk:backend-waking", onWaking);
        return () => window.removeEventListener("dietdesk:backend-waking", onWaking);
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight,
                gap: 1.5,
            }}
            role="status"
            aria-label="Loading"
        >
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
            {waking && (
                <p style={{ margin: 0, color: "#1d4ed8", fontSize: "0.875rem", fontWeight: 500 }}>
                    Starting secure server... Loading your dashboard.
                </p>
            )}
        </Box>
    );
}
