import { Box } from "@mui/material";

export default function RouteLoadingFallback({ minHeight = "40vh" }) {
    return (
        <Box
            sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight }}
            role="status"
            aria-label="Loading"
        >
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </Box>
    );
}
