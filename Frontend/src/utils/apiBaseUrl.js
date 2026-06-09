const HF_API_URL = "https://arrifection-nutrition-backend.hf.space";

export function getApiBaseUrl() {
    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        const isProductionHost =
            host === "dietdesk.online" || host === "www.dietdesk.online" || host.endsWith(".vercel.app");

        if (isProductionHost) {
            // Same-origin Vercel proxy — avoids HF DNS/CORS failures in user browsers
            return `${window.location.origin}/backend`;
        }
    }

    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/$/, "");
    }

    return "http://127.0.0.1:8000";
}

export { HF_API_URL };
