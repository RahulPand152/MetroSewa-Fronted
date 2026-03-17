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

// Optional: You can add interceptors here to inject tokens
axiosInstance.interceptors.request.use((config) => {
    const token = getCookie('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

export default axiosInstance;
