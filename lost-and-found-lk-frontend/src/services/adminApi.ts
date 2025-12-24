import axios from 'axios';
import { getApiBaseUrl } from './api';

const baseURL = getApiBaseUrl();

// Create admin API client
const adminApi = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Add token to requests
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminAccessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token refresh on 401
adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('adminRefreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${baseURL}/auth/admin/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data;
                    localStorage.setItem('adminAccessToken', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    return adminApi(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout
                localStorage.removeItem('adminAccessToken');
                localStorage.removeItem('adminRefreshToken');
                window.location.href = '/admin/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default adminApi;



