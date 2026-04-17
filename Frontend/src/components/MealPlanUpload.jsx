import { useRef, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

const ACCEPTED_TYPES = ["application/pdf"];

export default function MealPlanUpload({ file, onFileSelect, onUpload, disabled }) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFile = (files) => {
        const selected = files?.[0];
        if (!selected) return;
        if (!ACCEPTED_TYPES.includes(selected.type)) return;
        onFileSelect(selected);
    };

    const handleBrowse = () => {
        inputRef.current?.click();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragActive(false);
        handleFile(event.dataTransfer.files);
    };

    const handleChange = (event) => {
        handleFile(event.target.files);
    };

    return (
        <Paper variant="outlined" sx={{ p: 3, bgcolor: "background.paper" }}>
            <Stack spacing={3}>
                <Box
                    onClick={handleBrowse}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    sx={{
                        cursor: "pointer",
                        border: 2,
                        borderColor: dragActive ? "primary.main" : "divider",
                        borderStyle: "dashed",
                        borderRadius: 2,
                        p: { xs: 3, md: 4 },
                        textAlign: "center",
                        bgcolor: dragActive ? "action.hover" : "background.paper",
                        transition: "border-color 150ms ease, background-color 150ms ease",
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        hidden
                        onChange={handleChange}
                    />
                    <Stack spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                            Upload Meal Plan PDF
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Drag and drop a PDF here or browse your device.
                        </Typography>
                        <Button variant="outlined" size="small" onClick={handleBrowse}>
                            Select PDF
                        </Button>
                    </Stack>
                </Box>

                {file && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" spacing={2}>
                            <Typography variant="body2" fontWeight={700} noWrap>
                                {file.name}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => onUpload(file)}
                                disabled={disabled}
                            >
                                {disabled ? "Uploading…" : "Ready to load plan"}
                            </Button>
                        </Stack>
                    </Paper>
                )}
            </Stack>
        </Paper>
    );
}
