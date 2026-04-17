import { Button, Paper, Stack, Typography } from "@mui/material";

export default function EmptyPlanState({ onUploadClick }) {
    return (
        <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: "center", bgcolor: "background.paper" }}>
            <Stack spacing={2} alignItems="center">
                <Typography variant="h6" fontWeight={900} sx={{ textTransform: "uppercase", letterSpacing: "0.14em" }}>
                    No active meal plan yet
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
                    Upload or assign a meal plan to start tracking your meals
                </Typography>
                <Button variant="contained" size="large" onClick={onUploadClick}>
                    Upload Meal Plan
                </Button>
            </Stack>
        </Paper>
    );
}
