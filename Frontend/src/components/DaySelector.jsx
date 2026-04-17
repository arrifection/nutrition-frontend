import { Box, Tab, Tabs } from "@mui/material";

export default function DaySelector({ days, selectedIndex, onChange }) {
    if (!days || !days.length) return null;

    const handleChange = (_, value) => {
        onChange(value);
    };

    return (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Tabs
                value={selectedIndex}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Meal plan day selector"
                sx={{ mb: 2 }}
            >
                {days.map((day, index) => (
                    <Tab
                        key={day.dayLabel}
                        label={day.dayLabel}
                        value={index}
                        sx={{ textTransform: "none", minWidth: 120 }}
                    />
                ))}
            </Tabs>
        </Box>
    );
}
