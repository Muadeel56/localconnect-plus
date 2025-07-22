import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const response = await api.post('/accounts/request-password-reset/', { email });
      
      setToast({
        type: 'success',
        message: response.data.message || 'Password reset email sent successfully!'
      });
      setIsSubmitted(true);
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to send password reset email. Please try again.'
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
              Reset Password
            </h1>
            <p className="text-text-secondary">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    errors.email
                      ? 'border-error bg-error/10 text-error'
                      : 'border-border bg-bg-secondary text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email}</p>
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
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                <div className="text-success text-6xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Check Your Email
                </h3>
                <p className="text-text-secondary">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  If you don't see it, check your spam folder.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="btn btn-secondary w-full"
              >
                Send Another Email
              </button>
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

export default RequestPasswordReset; 