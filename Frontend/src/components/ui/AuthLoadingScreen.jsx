import { Box, CircularProgress } from "@mui/material";

export default function AuthLoadingScreen() {
    return (
        <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress size={40} sx={{ color: "var(--brand-green)" }} />
        </Box>
    );
}
