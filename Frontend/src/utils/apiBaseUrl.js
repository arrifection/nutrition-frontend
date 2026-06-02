const PRODUCTION_API_URL = "https://arrifection-nutrition-backend.hf.space";

export function getApiBaseUrl() {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/$/, "");
    }

    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        if (host === "dietdesk.online" || host === "www.dietdesk.online" || host.endsWith(".vercel.app")) {
            return PRODUCTION_API_URL;
        }
    }

    return "http://127.0.0.1:8000";
}
