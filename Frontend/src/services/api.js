import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiBaseUrl';
import { toFriendlyApiError } from '../utils/apiErrors';
import { COLD_START_MAX_RETRIES, COLD_START_RETRY_DELAY_MS, sleep } from '../utils/coldStart';
import { captureApiFailure, captureAuthFailure } from '../utils/sentry';

const API_BASE_URL = getApiBaseUrl();
export const TOKEN_KEY = 'dietdesk_token';
export const USER_KEY = 'dietdesk_user';
export const REFRESH_KEY = 'dietdesk_refresh';
export const TOKEN_EXPIRES_KEY = 'dietdesk_token_expires';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshInFlight = null;

export function clearAuthStorage() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

export function storeAuthTokens({ access_token, refresh_token, expires_in }) {
    if (access_token) {
        localStorage.setItem(TOKEN_KEY, access_token);
    }
    if (refresh_token) {
        localStorage.setItem(REFRESH_KEY, refresh_token);
    }
    if (expires_in) {
        localStorage.setItem(TOKEN_EXPIRES_KEY, String(Date.now() + expires_in * 1000));
    }
}

async function refreshAccessToken() {
    if (!refreshInFlight) {
        refreshInFlight = axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: localStorage.getItem(REFRESH_KEY) },
            { withCredentials: true, timeout: 30000 }
        ).finally(() => {
            refreshInFlight = null;
        });
    }
    const res = await refreshInFlight;
    storeAuthTokens(res.data);
    return res.data.access_token;
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;
        const detail = (error.response?.data?.detail || '').toString().toLowerCase();
        const isExpiredToken = status === 401 && detail.includes('invalid or expired token');

        if (isExpiredToken && original && !original._retried) {
            original._retried = true;
            try {
                const newToken = await refreshAccessToken();
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch {
                clearAuthStorage();
                window.dispatchEvent(new Event('dietdesk:auth-expired'));
            }
        } else if (isExpiredToken) {
            clearAuthStorage();
            window.dispatchEvent(new Event('dietdesk:auth-expired'));
        }

        return Promise.reject(error);
    }
);

const reportClientError = (entry) => {
    const payload = {
        level: 'error',
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        ...entry,
    };

    axios.post(`${API_BASE_URL}/client-log`, payload, { timeout: 8000 }).catch(() => {});
};

const handleResp = async (fn, context = 'request') => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return {
            success: false,
            error: "You're offline. Reconnect and try again.",
            retryable: true,
            offline: true,
        };
    }

    try {
        const response = await fn();
        return { success: true, data: response.data };
    } catch (error) {
        const friendly = toFriendlyApiError(error, context);

        const requestUrl = error.config?.baseURL && error.config?.url
            ? `${error.config.baseURL}${error.config.url}`
            : error.config?.url;
        console.error(`[DietDesk API] ${context}`, {
            userMessage: friendly.userMessage,
            technicalMessage: friendly.technicalMessage,
            status: friendly.status,
            route: error.config?.url,
            requestUrl,
            backendDetail: error.response?.data?.detail ?? null,
        });

        reportClientError({
            action: context,
            user_message: friendly.userMessage,
            technical_message: friendly.technicalMessage,
            path: error.config?.url,
            status: friendly.status ?? null,
        });

        const path = error.config?.url || '';
        const isAuthRoute = path.includes('/auth/');
        const isSessionExpiry = friendly.technicalMessage?.toLowerCase().includes('invalid or expired');

        if (isAuthRoute && !isSessionExpiry) {
            captureAuthFailure({
                action: context,
                status: friendly.status,
                technicalMessage: friendly.technicalMessage,
                userMessage: friendly.userMessage,
            });
        } else if ((friendly.status && friendly.status >= 500) || !error.response) {
            captureApiFailure({
                context,
                status: friendly.status,
                path,
                technicalMessage: friendly.technicalMessage,
                userMessage: friendly.userMessage,
            });
        }

        return {
            success: false,
            error: friendly.userMessage,
            retryable: friendly.retryable,
            coldStart: friendly.coldStart,
        };
    }
};

export async function executeWithColdStartRetry(requestFn, context, { onWaking } = {}) {
    let lastResult = await handleResp(requestFn, context);
    if (lastResult.success) {
        return lastResult;
    }

    let attempt = 0;
    while (!lastResult.success && (lastResult.coldStart || lastResult.retryable) && attempt < COLD_START_MAX_RETRIES) {
        onWaking?.();
        const delay = COLD_START_RETRY_DELAY_MS * (attempt + 1);
        await sleep(delay);
        lastResult = await handleResp(requestFn, context);
        attempt += 1;
    }

    return lastResult;
}

const withRetries = async (fn, context, retries = 2, delayMs = 1500) => {
    let lastResult;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        lastResult = await fn();
        if (lastResult.success || !lastResult.retryable || attempt === retries) {
            return lastResult;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
    return lastResult;
};

// Calculations (Stateless)
export const calculateBMI = (data) => handleResp(() => api.post('/bmi', data), 'calculate-bmi');
export const calculateBMR = (data) => handleResp(() => api.post('/bmr', data), 'calculate-bmr');
export const calculateAssessment = (data) => handleResp(() => api.post('/assessment/calculate', data), 'calculate-assessment');
export const calculateMacros = (data) => handleResp(() => api.post('/macros', data), 'calculate-macros');
export const getAdvice = (category) => handleResp(() => api.get('/advice', { params: { category } }), 'get-advice');

// Patients (DB)
export const getPatients = () => handleResp(() => api.get('/api/v1/patients'), 'list-patients');
export const getPatient = (id) => handleResp(() => api.get(`/api/v1/patients/${id}`), 'get-patient');
export const createPatient = (data) => handleResp(() => api.post('/api/v1/patients', data), 'create-patient');
export const updatePatient = (id, data) => handleResp(() => api.put(`/api/v1/patients/${id}`, data), 'update-patient');
export const deletePatient = (id) => handleResp(() => api.delete(`/api/v1/patients/${id}`), 'delete-patient');

// Plans (DB)
export const getPlan = (patientId) => handleResp(() => api.get(`/api/v1/plans/${patientId}`), 'get-plan');
export const savePlan = (patientId, data) => handleResp(() => api.post(`/api/v1/plans/${patientId}`, data), 'save-plan');
export const getPlanHistory = (patientId) => handleResp(() => api.get(`/api/v1/plans/${patientId}/history`), 'get-plan-history');
export const deletePlanHistoryItem = (patientId, planId) => handleResp(() => api.delete(`/api/v1/plans/${patientId}/history/${planId}`), 'delete-plan-history');

// Clinical Logs (DB)
export const getLogs = (patientId) => handleResp(() => api.get(`/api/v1/logs/${patientId}`), 'get-logs');
export const createLog = (data) => handleResp(() => api.post('/api/v1/logs', data), 'create-log');
export const updateLog = (id, data) => handleResp(() => api.put(`/api/v1/logs/${id}`, data), 'update-log');

// Reminders (DB)
export const getReminders = () => handleResp(() => api.get('/api/v1/reminders'), 'get-reminders');
export const dismissReminder = (id) => handleResp(() => api.delete(`/api/v1/reminders/${id}`), 'dismiss-reminder');

// Food Exchange (DB)
export const getExchangeList = (category = null) => {
    const url = category ? `/api/v1/exchange-list/category/${category}` : '/api/v1/exchange-list';
    return handleResp(() => api.get(url), 'get-exchange-list');
};

// Auth endpoints
export const loginUser = (data, options) => executeWithColdStartRetry(
    () => api.post('/auth/login', data),
    'login',
    options,
);
export const registerUser = (data, options) => executeWithColdStartRetry(
    () => api.post('/auth/register', data),
    'signup',
    options,
);
export const refreshSession = () => handleResp(() => api.post('/auth/refresh', { refresh_token: localStorage.getItem(REFRESH_KEY) }), 'refresh-session');
export const logoutUser = () => handleResp(() => api.post('/auth/logout'), 'logout');
export const getMe = (options) => executeWithColdStartRetry(
    () => api.get('/auth/me'),
    'session-check',
    options,
);
export const resendVerification = () => withRetries(
    () => handleResp(() => api.post('/auth/resend-verification'), 'resend-verification'),
    'resend-verification',
);
export const requestVerificationEmail = (data) => withRetries(
    () => handleResp(() => api.post('/auth/request-verification-email', data), 'request-verification'),
    'request-verification',
);

// MFA endpoints
export const setupMfa = () => handleResp(() => api.post('/auth/mfa/setup'), 'mfa-setup');
export const verifyMfaSetup = (code) => handleResp(
    () => api.post('/auth/mfa/verify-setup', { code }),
    'mfa-verify-setup',
);
export const verifyMfaLogin = (data) => handleResp(
    () => api.post('/auth/mfa/verify', data),
    'mfa-verify-login',
);
export const disableMfa = () => handleResp(() => api.delete('/auth/mfa/disable'), 'mfa-disable');

export const wakeBackend = () => handleResp(
    () => api.get('/warmup', { params: { ping_db: false }, timeout: 15000 }),
    'wake-backend',
);

export default api;
