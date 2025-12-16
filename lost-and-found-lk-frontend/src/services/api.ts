import axios from 'axios';

// Get the API base URL from environment variable or fallback to localhost
export const getApiBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // If VITE_API_URL is set, use it
    if (apiUrl) {
        return apiUrl;
    }
    
    // In development, use localhost
    if (import.meta.env.DEV) {
        return 'http://localhost:8082/api';
    }
    
    // In production, if no env var is set, this is an error
    // But we'll return empty string to make it obvious
    console.error('VITE_API_URL is not set in production!');
    return '';
};

const baseURL = getApiBaseUrl();

const api = axios.create({
    baseURL: baseURL || 'http://localhost:8082/api', // Fallback for safety
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
