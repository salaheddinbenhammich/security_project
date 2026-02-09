import axios from 'axios';
import { getToken, getRefreshToken, clearSession, login, isTokenExpired, updateActivity } from '../utils/auth';
import { showSuspensionCountdown } from '../utils/suspensionHandler';
import { toast } from 'sonner'; // ✅ ADD THIS IMPORT

// Runtime configuration from env-config.js (injected by Docker)
// Falls back to localhost if not running in Docker
const API_URL = window.ENV?.API_URL || 'http://localhost:8080/api';

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
 * SECURITY: Auto-logout on 401/403 errors (except password expiration)
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        console.log("=== API Interceptor - Error Caught ===");
        console.log("URL:", originalRequest?.url);
        console.log("Status:", error.response?.status);
        console.log("Error data:", error.response?.data);
        
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
        
        // ========== PASSWORD EXPIRATION HANDLING ==========
        if (error.response?.status === 403 && error.response?.data?.error === "PASSWORD_EXPIRED") {
            console.log("✅ Password expiration detected - passing through");
            return Promise.reject(error);
        }
        
        // ========== ACCOUNT SUSPENSION/DISABLED HANDLING ==========
        if (error.response?.status === 403 && error.response?.data?.error) {
            const errorCode = error.response.data.error;
            
            // ✅ FIX: Let pending approval errors pass through silently
            // The component will handle showing the warning message
            if (errorCode === 'ACCOUNT_NOT_APPROVED') {
                console.log("⏳ Account pending approval - passing error to component");
                // Don't show toast - let the component handle it
                // Just pass the error through
                return Promise.reject(error);
            }
            
            // These errors trigger countdown and forced logout
            const suspensionErrors = [
                'ACCOUNT_DISABLED',
                'ACCOUNT_DELETED',
                'ACCOUNT_LOCKED',
                'ACCOUNT_NOT_FOUND'
            ];
            
            if (suspensionErrors.includes(errorCode)) {
                console.log(`❌ Account suspended: ${errorCode}`);
                showSuspensionCountdown(errorCode);
                return Promise.reject(error);
            }
        }
        
        // Handle 401 Unauthorized (invalid/expired token)
        if (error.response?.status === 401) {
            console.log("❌ 401 Unauthorized - clearing session and redirecting");
            clearSession();
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
        
        // Handle other 403 errors
        if (error.response?.status === 403) {
            console.log("❌ 403 Forbidden - clearing session");
            clearSession();
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
        
        console.log("⚠️ Other error - passing through");
        return Promise.reject(error);
    }
);

export default api;