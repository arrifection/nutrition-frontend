import { Box, LinearProgress, Stack, Typography } from "@mui/material";

export default function DailyProgressHeader({ completed, total, planTitle, dayLabel }) {
    const progressValue = total ? Math.round((completed / total) * 100) : 0;

    return (
        <Box>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        {completed} of {total} meals completed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {planTitle} · {dayLabel}
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    {progressValue}% complete
                </Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
            />
        </Box>
    );
}
