import { getApiBaseUrl } from "../utils/apiBaseUrl";

const API_BASE_URL = getApiBaseUrl();
const TOKEN_KEY = "dietdesk_token";

export function getPdfDownloadName() {
    return "diet-plan.pdf";
}

export async function exportDietPlanPdf(payload) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/export-pdf`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) {
        throw new Error("Export failed");
    }

    return res.blob();
}
