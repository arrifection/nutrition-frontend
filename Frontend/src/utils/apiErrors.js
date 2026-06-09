const CONNECTION_HINT =
    "Please wait a few seconds and try again. If you already submitted the form, try Sign In — your account may already exist.";

const FRIENDLY_BY_STATUS = {
    400: null,
    401: null,
    403: null,
    404: "We couldn't find what you were looking for. Please refresh and try again.",
    429: "Too many attempts. Please wait a minute and try again.",
    500: "Something went wrong on our side. Please try again in a moment.",
    502: "Our service is waking up. Please try again in a few seconds.",
    503: "We're briefly unavailable. Please try again in a moment.",
    504: "This is taking longer than usual. Please try again in a few seconds.",
};

const FRIENDLY_BY_PHRASE = [
    { match: /username is already taken/i, text: "This username is already taken. Choose a different username and try again." },
    { match: /email is already registered/i, text: "This email is already registered. Sign in instead, or use Resend Verification Email on the login page." },
    { match: /already registered/i, text: "This username or email is already in use. Try Sign In, or use Resend Verification Email on the login page." },
    { match: /incorrect email or password/i, text: "Email or password is incorrect. Please check and try again." },
    { match: /verification period has ended/i, text: "Your verification window has ended. Use Resend Verification Email on the login page to get a new link." },
    { match: /verify your email to continue/i, text: "Please verify your email to continue. Use Resend Verification Email on the login page." },
    { match: /invalid or expired token/i, text: "Your session expired. Please sign in again." },
    { match: /database is temporarily unreachable/i, text: "We're having a brief connection issue. Please try again in a moment." },
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
            userMessage: `This is taking longer than expected. ${CONNECTION_HINT}`,
            technicalMessage: `Timeout during ${context}`,
            status,
            retryable: true,
        };
    }

    if (error?.message === "Network Error" || !error?.response) {
        return {
            userMessage: `We couldn't connect right now. ${CONNECTION_HINT}`,
            technicalMessage: error?.message || "No response from server",
            status,
            retryable: true,
        };
    }

    if (detail) {
        for (const rule of FRIENDLY_BY_PHRASE) {
            if (rule.match.test(detail)) {
                return {
                    userMessage: rule.text,
                    technicalMessage: detail,
                    status,
                    retryable: false,
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
    return {
        userMessage: statusMessage || "Something went wrong. Please try again.",
        technicalMessage: error?.message || `HTTP ${status || "unknown"}`,
        status,
        retryable: status >= 500 || status === 429,
    };
}
