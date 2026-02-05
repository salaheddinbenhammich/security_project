// src/utils/auth.js
// Enhanced authentication utilities with security improvements

/**
 * Complete session cleanup - removes all auth data
 * SECURITY: Always clear all tokens to prevent session fixation attacks
 */
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken'); // NEW: Store refresh token separately
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiry'); // NEW: Track token expiration
  localStorage.removeItem('lastActivity'); // NEW: Track user activity
};

/**
 * Login - store new session data (clears old session first)
 * SECURITY: Clear existing session before storing new credentials
 */
export const login = (authData) => {
  // CRITICAL: Clear any existing session first to prevent session fixation
  clearSession();
  
  // Store access token
  localStorage.setItem('token', authData.token);
  
  // Store refresh token separately (NEW)
  if (authData.refreshToken) {
    localStorage.setItem('refreshToken', authData.refreshToken);
  }
  
  // Calculate and store token expiry time (NEW)
  // Assuming 24-hour expiry (86400000 ms)
  const expiryTime = Date.now() + 86400000;
  localStorage.setItem('tokenExpiry', expiryTime.toString());
  
  // Track last activity time (NEW)
  localStorage.setItem('lastActivity', Date.now().toString());
  
  // Store user info
  localStorage.setItem('user', JSON.stringify({
    id: authData.id,
    username: authData.username,
    email: authData.email,
    firstName: authData.firstName,
    lastName: authData.lastName,
    role: authData.role,
  }));
};

/**
 * Logout - clear session
 */
export const logout = () => {
  clearSession();
};

/**
 * Get current user from localStorage
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Get current access token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get refresh token (NEW)
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if token is expired (NEW)
 * SECURITY: Prevent using expired tokens
 */
export const isTokenExpired = () => {
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  return Date.now() > parseInt(expiry);
};

/**
 * Check if session is inactive for too long (NEW)
 * SECURITY: Auto-logout after 30 minutes of inactivity
 */
export const isSessionInactive = () => {
  const lastActivity = localStorage.getItem('lastActivity');
  if (!lastActivity) return true;
  
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  return Date.now() - parseInt(lastActivity) > INACTIVITY_TIMEOUT;
};

/**
 * Update last activity timestamp (NEW)
 * Call this on user interactions
 */
export const updateActivity = () => {
  localStorage.setItem('lastActivity', Date.now().toString());
};

/**
 * Check if current user is admin
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'ADMIN';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user) => {
  if (!user) return 'U';
  
  if (user.firstName) {
    return `${user.firstName[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }
  
  return (user.username?.slice(0, 2) || 'U').toUpperCase();
};

/**
 * Validate password strength (NEW)
 * SECURITY: Client-side password validation
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar,
    errors: {
      length: password.length < minLength,
      uppercase: !hasUpperCase,
      lowercase: !hasLowerCase,
      digit: !hasDigit,
      specialChar: !hasSpecialChar,
    }
  };
};

/**
 * Get password strength level (NEW)
 * Returns: 'weak', 'medium', 'strong'
 */
export const getPasswordStrength = (password) => {
  const validation = validatePassword(password);
  const errorCount = Object.values(validation.errors).filter(Boolean).length;
  
  if (errorCount >= 3) return 'weak';
  if (errorCount >= 1) return 'medium';
  return 'strong';
};