import axios from 'axios';

// Get the API base URL from environment variable or fallback
export const getApiBaseUrl = () => {
    // Check for environment variable (set at build time by Vite)
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // If VITE_API_URL is set and not empty, use it (remove trailing slash if present)
    if (apiUrl && typeof apiUrl === 'string' && apiUrl.trim()) {
        const url = apiUrl.trim().replace(/\/$/, '');
        console.log('✅ Using VITE_API_URL from environment:', url);
        return url;
    }
    
    // In development, use localhost
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        const devUrl = 'http://localhost:8082/api';
        console.log('Development mode - using localhost:', devUrl);
        return devUrl;
    }
    
    // In production, use relative URL to call Vercel serverless functions on same domain
    // This will use /api/* routes which are handled by Vercel serverless functions
    const fallbackUrl = '/api';
    console.log('Production mode - using relative API path:', fallbackUrl);
    return fallbackUrl;
};

const baseURL = getApiBaseUrl();

// Log the base URL on initialization
console.log('API Base URL configured:', baseURL);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('Is DEV mode:', import.meta.env.DEV);
console.log('Is PROD mode:', import.meta.env.PROD);

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
        console.log('API Request:', config.method?.toUpperCase(), fullUrl);
        console.log('Base URL:', config.baseURL, '| URL:', config.url);
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
