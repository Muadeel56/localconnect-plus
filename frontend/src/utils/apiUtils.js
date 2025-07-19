// Utility functions for handling API errors and authentication

export const handleApiError = (error, authContext) => {
  // Don't handle 401 errors here - let the interceptor handle them
  if (error.response?.status === 401) {
    return {
      success: false,
      error: 'Authentication required. Please log in again.',
      shouldLogout: true
    };
  }

  // Handle other errors
  const errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'An unexpected error occurred';

  return {
    success: false,
    error: errorMessage,
    shouldLogout: false
  };
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}; 