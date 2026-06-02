import { Box } from "@mui/material";

export default function FullPageSpinner() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </Box>
    );
}
