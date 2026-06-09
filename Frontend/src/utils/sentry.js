const PRODUCTION_HOSTS = new Set(["dietdesk.online", "www.dietdesk.online"]);

const SENTRY_DSN = (import.meta.env.VITE_SENTRY_DSN || "").trim();
const SENTRY_RELEASE = (import.meta.env.VITE_SENTRY_RELEASE || "").trim();
const SENTRY_ENVIRONMENT = (import.meta.env.VITE_SENTRY_ENVIRONMENT || "production").trim();

let sentryLoadPromise = null;

function isProductionHost() {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;
    return PRODUCTION_HOSTS.has(host) || host.endsWith(".vercel.app");
}

export function isSentryEnabled() {
    if (!import.meta.env.PROD || !SENTRY_DSN) return false;
    return isProductionHost();
}

function loadSentry() {
    if (!isSentryEnabled()) return Promise.resolve(null);
    if (!sentryLoadPromise) {
        sentryLoadPromise = import("@sentry/react").then((Sentry) => {
            Sentry.init({
                dsn: SENTRY_DSN,
                environment: SENTRY_ENVIRONMENT,
                release: SENTRY_RELEASE || undefined,
                integrations: [Sentry.browserTracingIntegration()],
                tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "0.05"),
                sendDefaultPii: false,
                beforeSend(event) {
                    const message = event.exception?.values?.[0]?.value || event.message || "";
                    if (typeof message === "string" && message.includes("ResizeObserver loop")) {
                        return null;
                    }
                    return event;
                },
            });
            return Sentry;
        });
    }
    return sentryLoadPromise;
}

export function initSentry() {
    if (!isSentryEnabled()) return;
    const schedule = typeof window !== "undefined" && window.requestIdleCallback
        ? window.requestIdleCallback
        : (cb) => setTimeout(cb, 1);
    schedule(() => {
        loadSentry().catch(() => {});
    });
}

function runWithSentry(runner) {
    if (!isSentryEnabled()) return;
    loadSentry()
        .then((Sentry) => {
            if (Sentry) runner(Sentry);
        })
        .catch(() => {});
}

function withScope(Sentry, tags, extra, fn) {
    Sentry.withScope((scope) => {
        Object.entries(tags || {}).forEach(([key, value]) => {
            if (value != null) scope.setTag(key, String(value));
        });
        if (extra) scope.setExtras(extra);
        fn(scope);
    });
}

export function captureReactError(error, componentStack) {
    runWithSentry((Sentry) => {
        Sentry.captureException(error, {
            contexts: { react: { componentStack } },
            tags: { area: "react" },
        });
    });
}

export function captureApiFailure({ context, status, path, technicalMessage, userMessage }) {
    runWithSentry((Sentry) => {
        withScope(
            Sentry,
            { area: "api", context: context || "request", status: status ?? "network" },
            { path, technicalMessage, userMessage },
            () => {
                Sentry.captureMessage(technicalMessage || userMessage || "API request failed", "error");
            }
        );
    });
}

export function captureAuthFailure({ action, status, technicalMessage, userMessage }) {
    runWithSentry((Sentry) => {
        withScope(
            Sentry,
            { area: "auth", action: action || "auth", status: status ?? "unknown" },
            { technicalMessage, userMessage },
            () => {
                Sentry.captureMessage(technicalMessage || userMessage || "Auth request failed", "warning");
            }
        );
    });
}

export function capturePdfExportFailure(error, extra = {}) {
    runWithSentry((Sentry) => {
        Sentry.withScope((scope) => {
            scope.setTag("area", "pdf_export");
            scope.setExtras(extra);
            if (error instanceof Error) {
                Sentry.captureException(error);
            } else {
                Sentry.captureMessage(String(error), "error");
            }
        });
    });
}

export function captureUnhandledError(error, extra = {}) {
    runWithSentry((Sentry) => {
        Sentry.withScope((scope) => {
            scope.setTag("area", "unhandled");
            scope.setExtras(extra);
            Sentry.captureException(error);
        });
    });
}

export async function triggerSentryTestError() {
    if (!isSentryEnabled()) {
        throw new Error("Sentry is disabled in this environment.");
    }
    const Sentry = await loadSentry();
    Sentry.captureException(new Error("DietDesk Sentry frontend test error"));
    await Sentry.flush(2000);
}
