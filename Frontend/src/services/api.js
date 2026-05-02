import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const TOKEN_KEY = 'dietdesk_token';
const USER_KEY = 'dietdesk_user';




const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Bearer token from localStorage to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const detail = (error.response?.data?.detail || '').toString().toLowerCase();
        const isExpiredToken = status === 401 && detail.includes('invalid or expired token');

        if (isExpiredToken) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            window.dispatchEvent(new Event('dietdesk:auth-expired'));
        }

        return Promise.reject(error);
    }
);

// Helper for unified response handling
const handleResp = async (fn) => {
    try {
        const response = await fn();
        return { success: true, data: response.data };
    } catch (error) {
        console.error('API Error:', error);
        const message = error.code === 'ECONNABORTED'
            ? 'Backend/database connection timed out. Please check MongoDB Atlas Network Access.'
            : error.response?.data?.detail
                || error.message
                || 'API request failed';
        const url = error.config?.url ? ` (${error.config.url})` : '';
        
        return {
            success: false,
            error: `${message}${url}`
        };
    }
};

// Calculations (Stateless)
export const calculateBMI = (data) => handleResp(() => api.post('/bmi', data));
export const calculateBMR = (data) => handleResp(() => api.post('/bmr', data));
export const calculateMacros = (data) => handleResp(() => api.post('/macros', data));
export const getAdvice = (category) => handleResp(() => api.get('/advice', { params: { category } }));

// Patients (DB)
export const getPatients = () => handleResp(() => api.get('/api/v1/patients'));
export const getPatient = (id) => handleResp(() => api.get(`/api/v1/patients/${id}`));
export const createPatient = (data) => handleResp(() => api.post('/api/v1/patients', data));
export const updatePatient = (id, data) => handleResp(() => api.put(`/api/v1/patients/${id}`, data));
export const deletePatient = (id) => handleResp(() => api.delete(`/api/v1/patients/${id}`));

// Plans (DB)
export const getPlan = (patientId) => handleResp(() => api.get(`/api/v1/plans/${patientId}`));
export const savePlan = (patientId, data) => handleResp(() => api.post(`/api/v1/plans/${patientId}`, data));

// Clinical Logs (DB)
export const getLogs = (patientId) => handleResp(() => api.get(`/api/v1/logs/${patientId}`));
export const createLog = (data) => handleResp(() => api.post('/api/v1/logs', data));
export const updateLog = (id, data) => handleResp(() => api.put(`/api/v1/logs/${id}`, data));

// Reminders (DB)
export const getReminders = () => handleResp(() => api.get('/api/v1/reminders'));
export const dismissReminder = (id) => handleResp(() => api.delete(`/api/v1/reminders/${id}`));

// Food Exchange (DB)
export const getExchangeList = (category = null) => {
    const url = category ? `/api/v1/exchange-list/category/${category}` : '/api/v1/exchange-list';
    return handleResp(() => api.get(url));
};

// Auth endpoints
export const loginUser    = (data) => handleResp(() => api.post('/auth/login', data));
export const registerUser = (data) => handleResp(() => api.post('/auth/register', data));
export const getMe        = ()     => handleResp(() => api.get('/auth/me'));
export const resendVerification = () => handleResp(() => api.post('/auth/resend-verification'));

export default api;
