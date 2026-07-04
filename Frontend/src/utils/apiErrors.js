import { getColdStartMessage, isBackendWakingError } from "./coldStart";

const CONNECTION_HINT =
    "The secure server is starting. Please wait a few seconds and try again.";

const FRIENDLY_BY_STATUS = {
    400: null,
    401: null,
    403: null,
    404: "We couldn't find what you were looking for. Please refresh and try again.",
    429: "Too many attempts. Please wait a minute and try again.",
    500: "The server is still starting. Please try again in a few seconds.",
    502: "Backend is waking up... Please try again in a few seconds.",
    503: "Backend is waking up... Please try again in a few seconds.",
    504: "Backend is waking up... This is taking longer than usual.",
};

const FRIENDLY_BY_PHRASE = [
    { match: /username is already taken/i, text: "This username is already taken. Choose a different username and try again." },
    { match: /email is already registered/i, text: "This email is already registered. Sign in instead, or use Resend Verification Email on the login page." },
    { match: /already registered/i, text: "This username or email is already in use. Try Sign In, or use Resend Verification Email on the login page." },
    { match: /incorrect email or password/i, text: "Email or password is incorrect. Please check and try again." },
    { match: /verification period has ended/i, text: "Your verification window has ended. Use Resend Verification Email on the login page to get a new link." },
    { match: /verify your email to continue/i, text: "Please verify your email to continue. Use Resend Verification Email on the login page." },
    { match: /invalid or expired token/i, text: "Your session expired. Please sign in again." },
    { match: /invalid or expired refresh token/i, text: "Your session expired. Please sign in again." },
    { match: /failed login attempts/i, text: "Too many failed login attempts. Please wait and try again." },
    { match: /password must include/i, text: null },
    { match: /password must be at least/i, text: null },
    { match: /database is temporarily unreachable/i, text: "We're connecting to the secure database. Please wait a few seconds and try again." },
    { match: /couldn't save this patient/i, text: "We couldn't save this patient right now. Please check height, weight, and age, then try again." },
    { match: /weight must be between/i, text: "Please enter a valid weight between 5 and 300 kg." },
    { match: /height must be between/i, text: "Please enter a valid height between 50 and 250 cm." },
    { match: /could not send verification email/i, text: "We couldn't send the verification email right now. Please try again in a few minutes." },
];

export function stripTechnicalSuffix(message = "") {
    return message.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function toFriendlyApiError(error, context = "request") {
    const status = error?.response?.status;
    const rawDetail = error?.response?.data?.detail;
    const detail = typeof rawDetail === "string"
        ? stripTechnicalSuffix(rawDetail)
        : Array.isArray(rawDetail)
            ? stripTechnicalSuffix(rawDetail.map((d) => d?.msg).filter(Boolean).join(" "))
            : "";

    if (error?.code === "ECONNABORTED") {
        return {
            userMessage: getColdStartMessage(context),
            technicalMessage: `Timeout during ${context}`,
            status,
            retryable: true,
            coldStart: true,
        };
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
        return {
            userMessage: "You're offline. Reconnect and try again.",
            technicalMessage: "Browser offline",
            status,
            retryable: true,
        };
    }

    if (error?.message === "Network Error" || !error?.response) {
        return {
            userMessage: getColdStartMessage(context),
            technicalMessage: error?.message || "No response from server",
            status,
            retryable: true,
            coldStart: true,
        };
    }

    if (detail) {
        for (const rule of FRIENDLY_BY_PHRASE) {
            if (rule.match.test(detail)) {
                const isDbRetry = /database is temporarily unreachable/i.test(detail);
                return {
                    userMessage: rule.text ?? detail,
                    technicalMessage: detail,
                    status,
                    retryable: isDbRetry || false,
                    coldStart: isDbRetry || status === 503,
                };
            }
        }
    }

    if (detail) {
        return {
            userMessage: detail,
            technicalMessage: detail,
            status,
            retryable: status >= 500,
        };
    }

    const statusMessage = FRIENDLY_BY_STATUS[status];
    const coldStart = isBackendWakingError(error);
    return {
        userMessage: coldStart
            ? getColdStartMessage(context)
            : (statusMessage || "Please try again in a moment."),
        technicalMessage: error?.message || `HTTP ${status || "unknown"}`,
        status,
        retryable: status >= 500 || status === 429 || coldStart,
        coldStart,
    };
}
