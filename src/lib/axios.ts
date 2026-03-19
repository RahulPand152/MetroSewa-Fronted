import axios from 'axios';
import { getCookie } from './cookies';

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

export default axiosInstance;
