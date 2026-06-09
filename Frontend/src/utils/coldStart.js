export const COLD_START_RETRY_DELAY_MS = 2500;

const CONTEXT_MESSAGES = {
    login: "Starting secure server... Trying again in a few seconds.",
    signup: "Backend is waking up... Trying again in a few seconds.",
    "resend-verification": "Backend is waking up... Trying again in a few seconds.",
    "request-verification": "Backend is waking up... Trying again in a few seconds.",
    "session-check": "Starting secure server... Loading your dashboard.",
    "verify-email": "Starting secure server... Confirming your email.",
    "wake-backend": "Starting secure server...",
    default: "Backend is waking up... Trying again in a few seconds.",
};

export function isBackendWakingError(error) {
    if (typeof navigator !== "undefined" && !navigator.onLine) return false;
    const status = error?.response?.status;
    if (error?.code === "ECONNABORTED") return true;
    if (!error?.response || error?.message === "Network Error") return true;
    return status === 502 || status === 503 || status === 504;
}

export function getColdStartMessage(context = "default") {
    return CONTEXT_MESSAGES[context] || CONTEXT_MESSAGES.default;
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
