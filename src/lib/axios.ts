import axios from 'axios';
import { getCookie } from './cookies';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies/sessions if the backend uses them
    headers: {
        'Content-Type': 'application/json',
    },
});

// Inject auth token + fix Content-Type for FormData (multipart) uploads
axiosInstance.interceptors.request.use((config) => {
    const token = getCookie('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // When sending FormData, let the browser set Content-Type automatically
    // (it includes the correct multipart boundary). Manually setting it breaks uploads.
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

// Add a response interceptor for global toast notifications
axiosInstance.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toLowerCase();
        // Show success toast for mutation requests (POST, PUT, PATCH, DELETE) if a message is provided
        if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
            if (response.data && response.data.message) {
                toast.success(response.data.message);
            }
        }
        return response;
    },
    (error) => {
        // Extract the error message from the response or use a fallback
        const message =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred';

        // Suppress error toasts for expected auth check failures (e.g., when logged out)
        // particularly for background GET requests like fetching the user profile.
        const isAuthError = error.response?.status === 401 || error.response?.status === 403;
        const isGetRequest = error.config?.method?.toLowerCase() === 'get';
        const isNoTokenMsg = message.includes('No token provided') || message.includes('Access denied');

        if ((isAuthError && isGetRequest) || isNoTokenMsg) {
            // Silently reject without showing a toast
            return Promise.reject(error);
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
