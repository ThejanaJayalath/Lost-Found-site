import axios from 'axios';

// Get the API base URL from environment variable or fallback to localhost
export const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:8082/api';
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
