import { Box, Divider, FormControlLabel, List, ListItem, ListItemText, Paper, Stack, Typography, Checkbox } from "@mui/material";

export default function MealChecklistCard({ meal, onToggleComplete }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 3,
                bgcolor: meal.completed ? "action.selected" : "background.paper",
                opacity: meal.completed ? 0.95 : 1,
                transition: "background-color 160ms ease",
            }}
        >
            <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>
                            {meal.mealType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {meal.recommendedTime}
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={<Checkbox checked={meal.completed} onChange={() => onToggleComplete(meal.id)} />}
                        label={meal.completed ? "Completed" : "Mark as completed"}
                    />
                </Stack>
                <Divider />
                <List disablePadding>
                    {meal.items.map((item) => (
                        <ListItem key={item} disablePadding>
                            <ListItemText
                                primary={item}
                                primaryTypographyProps={{ variant: "body2", sx: { fontWeight: 500 } }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Stack>
        </Paper>
    );
}
