import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send username and password directly (no conversion needed)
      const loginData = {
        username: formData.username,
        password: formData.password
      };
      
      console.log('Attempting login with:', loginData);
      const result = await login(loginData);
      console.log('Login result:', result);
      
      if (result.success) {
        setToast({
          type: 'success',
          message: 'Login successful! Welcome back!'
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setToast({
          type: 'error',
          message: result.error || 'Invalid credentials. Please try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setToast({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center py-8 sm:py-12 lg:py-16 px-4 transition-all duration-300">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
        {/* Enhanced Card with better theme support */}
        <div className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-300">
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Header with improved styling */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--gradient-primary)' }}>
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3 transition-colors duration-300">
                Welcome Back
              </h1>
              <p className="text-text-secondary text-base sm:text-lg transition-colors duration-300">
                Sign in to your LocalConnect+ account
              </p>
            </div>

            {/* Enhanced Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field with improved UX */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-text-primary transition-colors duration-300">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.username 
                        ? 'border-red-500' 
                        : ''
                    }`}
                    style={{
                      borderColor: errors.username ? '#ef4444' : 'var(--border-primary)',
                      backgroundColor: errors.username ? '#fef2f2' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      '::placeholder': { color: 'var(--text-tertiary)' }
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-card)';
                      e.target.style.boxShadow = '0 0 0 2px var(--color-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = errors.username ? '#fef2f2' : 'var(--bg-secondary)';
                      e.target.style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => {
                      if (!errors.username) e.target.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!errors.username) e.target.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.username && (
                  <p className="text-sm flex items-center animate-pulse" style={{ color: 'var(--error-text)' }}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field with show/hide functionality */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary transition-colors duration-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 pr-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.password 
                        ? 'border-red-500' 
                        : ''
                    }`}
                    style={{
                      borderColor: errors.password ? '#ef4444' : 'var(--border-primary)',
                      backgroundColor: errors.password ? '#fef2f2' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-card)';
                      e.target.style.boxShadow = '0 0 0 2px var(--color-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = errors.password ? '#fef2f2' : 'var(--bg-secondary)';
                      e.target.style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => {
                      if (!errors.password) e.target.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!errors.password) e.target.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-tertiary)'}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm flex items-center animate-pulse" style={{ color: 'var(--error-text)' }}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password with improved layout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded transition-all duration-200"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--color-primary)'
                    }}
                    disabled={isLoading}
                  />
                  <span className="text-sm transition-colors duration-200" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                    Remember me
                  </span>
                </label>
                <Link
                  to="/request-password-reset"
                  className="text-sm transition-colors duration-200 font-medium hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-lg"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.opacity = '0.9';
                    e.target.style.boxShadow = 'var(--shadow-xl)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.boxShadow = 'var(--shadow-lg)';
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px var(--color-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'var(--shadow-lg)';
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Enhanced Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-text-secondary transition-colors duration-300">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login; 