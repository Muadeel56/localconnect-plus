import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get token from URL params
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    if (!token) {
      newErrors.token = 'Reset token is required';
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
      const response = await api.post('/accounts/reset-password/', {
        token: token,
        new_password: formData.new_password
      });
      
      setToast({
        type: 'success',
        message: response.data.message || 'Password reset successfully!'
      });
      setIsSubmitted(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={5000}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Set New Password
            </h1>
            <p className="text-text-secondary">
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Field (hidden if from URL) */}
              {!token && (
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-text-primary mb-2">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    id="token"
                    name="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      errors.token
                        ? 'border-error bg-error/10 text-error'
                        : 'border-border bg-bg-secondary text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20'
                    }`}
                    placeholder="Enter reset token"
                    disabled={isLoading}
                  />
                  {errors.token && (
                    <p className="mt-1 text-sm text-error">{errors.token}</p>
                  )}
                </div>
              )}

              {/* New Password Field */}
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-text-primary mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    errors.new_password
                      ? 'border-error bg-error/10 text-error'
                      : 'border-border bg-bg-secondary text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                {errors.new_password && (
                  <p className="mt-1 text-sm text-error">{errors.new_password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-text-primary mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    errors.confirm_password
                      ? 'border-error bg-error/10 text-error'
                      : 'border-border bg-bg-secondary text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-error">{errors.confirm_password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-3 text-lg font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-5 h-5 mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                <div className="text-success text-6xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Password Reset Successfully!
                </h3>
                <p className="text-text-secondary">
                  Your password has been updated. Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Remember your password?{' '}
              <Link to="/login" className="text-accent hover:text-accent/80 font-medium">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword; 