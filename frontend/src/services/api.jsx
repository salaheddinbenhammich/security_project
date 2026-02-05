import axios from 'axios';
import { getToken, getRefreshToken, clearSession, login, isTokenExpired, updateActivity } from '../utils/auth';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh completion
 */
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers when refresh completes
 */
const onRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

/**
 * Request interceptor - Add auth token and track activity
 * SECURITY: Automatically refresh expired tokens
 */
api.interceptors.request.use(
    async (config) => {
        const token = getToken();
        
        if (token) {
            // Check if token is expired
            if (isTokenExpired() && !isRefreshing) {
                const refreshToken = getRefreshToken();
                
                if (refreshToken) {
                    isRefreshing = true;
                    
                    try {
                        // Attempt to refresh token
                        const response = await axios.post(`${API_URL}/auth/refresh`, {
                            refreshToken: refreshToken
                        });
                        
                        // Store new tokens
                        login(response.data);
                        
                        // Update config with new token
                        config.headers['Authorization'] = `Bearer ${response.data.token}`;
                        
                        // Notify subscribers
                        onRefreshed(response.data.token);
                        
                    } catch (error) {
                        // Refresh failed - logout user
                        clearSession();
                        window.location.href = '/login';
                        return Promise.reject(error);
                    } finally {
                        isRefreshing = false;
                    }
                } else {
                    // No refresh token - logout
                    clearSession();
                    window.location.href = '/login';
                    return Promise.reject(new Error('No refresh token available'));
                }
            } else {
                // Token is valid - add to headers
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            
            // Update activity timestamp on each request
            updateActivity();
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle auth errors
 * SECURITY: Auto-logout on 401/403 errors
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If token refresh is in progress, queue this request
        if (isRefreshing && !originalRequest._retry) {
            originalRequest._retry = true;
            
            return new Promise((resolve) => {
                subscribeTokenRefresh((token) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
        }
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            clearSession();
            window.location.href = '/login';
        }
        
        // Handle 403 Forbidden (account locked/disabled)
        if (error.response?.status === 403) {
            // Show appropriate error message
            const message = error.response?.data?.message || 'Access forbidden';
            console.error(message);
        }
        
        return Promise.reject(error);
    }
);

export default api;