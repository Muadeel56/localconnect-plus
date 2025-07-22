import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Update theme when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/accounts/login/', credentials);
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    console.log('AuthContext register called with:', userData);
    alert('Register function called!');
    try {
      console.log('Making API call to /accounts/register/');
      const response = await api.post('/accounts/register/', userData);
      console.log('API response:', response.data);
      const { access, refresh, user: newUser } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.error('Registration API error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle backend validation errors
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = 'Registration failed';
        
        // Check for specific field errors
        if (backendErrors.password) {
          errorMessage = Array.isArray(backendErrors.password) 
            ? backendErrors.password[0] 
            : backendErrors.password;
        } else if (backendErrors.password2) {
          errorMessage = Array.isArray(backendErrors.password2) 
            ? backendErrors.password2[0] 
            : backendErrors.password2;
        } else if (backendErrors.first_name) {
          errorMessage = Array.isArray(backendErrors.first_name) 
            ? backendErrors.first_name[0] 
            : backendErrors.first_name;
        } else if (backendErrors.last_name) {
          errorMessage = Array.isArray(backendErrors.last_name) 
            ? backendErrors.last_name[0] 
            : backendErrors.last_name;
        } else if (backendErrors.email) {
          errorMessage = Array.isArray(backendErrors.email) 
            ? backendErrors.email[0] 
            : backendErrors.email;
        } else if (backendErrors.username) {
          errorMessage = Array.isArray(backendErrors.username) 
            ? backendErrors.username[0] 
            : backendErrors.username;
        } else if (backendErrors.non_field_errors) {
          errorMessage = Array.isArray(backendErrors.non_field_errors) 
            ? backendErrors.non_field_errors[0] 
            : backendErrors.non_field_errors;
        }
        
        return { success: false, error: errorMessage };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Validate token and refresh if needed
  const validateAndRefreshToken = async () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!token || !refreshToken) {
      logout();
      return false;
    }

    try {
      // Try to get current user with existing token
      const response = await api.get('/accounts/current-user/');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          // Try to refresh the token
          const refreshResponse = await api.post('/accounts/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = refreshResponse.data;
          localStorage.setItem('access_token', access);
          
          // Get user data with new token
          const userResponse = await api.get('/accounts/current-user/');
          const userData = userResponse.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          return false;
        }
      } else {
        console.error('Auth validation failed:', error);
        logout();
        return false;
      }
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const isValid = await validateAndRefreshToken();
      
      if (!isValid) {
        // Clear any invalid data
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    validateAndRefreshToken,
    theme,
    toggleTheme,
    isAuthenticated: !!user
  };
  
  console.log('AuthContext value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 