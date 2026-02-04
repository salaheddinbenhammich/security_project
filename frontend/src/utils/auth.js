// src/utils/auth.js
// Centralized authentication utilities

/**
 * Complete session cleanup - removes all auth data
 */
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Add any other auth-related items you might store in the future
};

/**
 * Login - store new session data (clears old session first)
 */
export const login = (authData) => {
  // CRITICAL: Clear any existing session first
  clearSession();
  
  // Now store the new session
  localStorage.setItem('token', authData.token);
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
 * Get current token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
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