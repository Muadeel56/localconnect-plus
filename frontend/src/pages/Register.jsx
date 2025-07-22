import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    role: 'USER'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  console.log('Register component rendered');
  console.log('useAuth register function:', register);
  console.log('useNavigate function:', navigate);
  console.log('Environment check - API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    console.log('Validating form with data:', formData);
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert('Form submitted!');
    console.log('Register form submitted');
    console.log('Event:', e);
    console.log('Form data at submission:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    console.log('Form data:', formData);
    setIsLoading(true);
    
    try {
      console.log('Calling register function...');
      console.log('Register function:', register);
      const result = await register({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password2: formData.password2,
        role: formData.role
      });
      
      console.log('Register result:', result);
      
      if (result.success) {
        setToast({
          type: 'success',
          message: 'Registration successful! Welcome to LocalConnect+!'
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setToast({
          type: 'error',
          message: result.error
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setToast({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
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
      
      {/* Debug info */}
      <div style={{ position: 'fixed', top: '10px', left: '10px', background: 'red', color: 'white', padding: '10px', zIndex: 9999 }}>
        Toast: {toast ? `${toast.type}: ${toast.message}` : 'No toast'}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'var(--gradient-accent)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Join LocalConnect+</h1>
            <p className="text-text-secondary">Create your account and start connecting</p>
          </div>

          {/* Register Form */}
          <div className="card animate-fade-in">
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-6" id="register-form" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('Enter key pressed in form');
                }
              }}>
                {/* Username Field */}
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`form-input ${errors.username ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="Choose a username"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-error-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name Field */}
                  <div className="form-group">
                    <label htmlFor="first_name" className="form-label">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`form-input ${errors.first_name ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                        placeholder="Enter your first name"
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-error-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div className="form-group">
                    <label htmlFor="last_name" className="form-label">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`form-input ${errors.last_name ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                        placeholder="Enter your last name"
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-error-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="Create a password"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Password must be at least 8 characters long and not too common
                  </p>
                  {errors.password && (
                    <p className="mt-1 text-sm text-error-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="form-group">
                  <label htmlFor="password2" className="form-label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password2"
                      name="password2"
                      value={formData.password2}
                      onChange={handleChange}
                      className={`form-input ${errors.password2 ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  {errors.password2 && (
                    <p className="mt-1 text-sm text-error-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password2}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isLoading}
                  >
                    <option value="USER">Regular User</option>
                    <option value="VOLUNTEER">Volunteer</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  onClick={(e) => {
                    alert('Button clicked!');
                    console.log('Button clicked');
                    console.log('Form data:', formData);
                    console.log('Form validation:', validateForm());
                    // Manually trigger form submission
                    if (validateForm()) {
                      console.log('Form is valid, calling handleSubmit');
                      handleSubmit(e);
                    } else {
                      console.log('Form is invalid, not submitting');
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner w-4 h-4"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Create Account</span>
                    </>
                  )}
                </button>
                
                {/* Test Button */}
                <button
                  type="button"
                  className="btn btn-secondary w-full mt-4"
                  onClick={async () => {
                    console.log('Test button clicked');
                    console.log('Current form data:', formData);
                    console.log('Is loading:', isLoading);
                    
                    // Test API call with axios
                    try {
                      console.log('Testing API call with axios...');
                      const axios = (await import('axios')).default;
                      const response = await axios.post('http://localhost:8000/api/accounts/register/', {
                        username: 'testuser2',
                        email: 'test2@example.com',
                        first_name: 'Test',
                        last_name: 'User',
                        password: 'testpass123',
                        password2: 'testpass123',
                        role: 'USER'
                      });
                      console.log('Axios API response status:', response.status);
                      console.log('Axios API response data:', response.data);
                    } catch (error) {
                      console.error('Axios API test error:', error.response?.data || error.message);
                    }
                  }}
                >
                  Test API Call
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-text-secondary">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-medium transition-colors duration-200 underline decoration-2 underline-offset-2"
                    style={{ color: 'var(--primary-600)' }}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register; 