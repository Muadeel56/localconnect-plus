import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get token from URL params
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      handleVerification(tokenFromUrl);
    } else {
      setVerificationStatus('error');
      setToast({
        type: 'error',
        message: 'No verification token found in the URL.'
      });
    }
  }, [searchParams]);

  const handleVerification = async (verificationToken) => {
    setIsLoading(true);
    
    try {
      const response = await api.post('/accounts/verify-email/', { token: verificationToken });
      
      setVerificationStatus('success');
      setToast({
        type: 'success',
        message: response.data.message || 'Email verified successfully!'
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setVerificationStatus('error');
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Email verification failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    // This would require a resend verification endpoint
    setToast({
      type: 'info',
      message: 'Please contact support to resend verification email.'
    });
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-[var(--color-dark-text)] font-bold text-2xl">L</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Email Verification</h1>
            <p className="text-text-secondary">Verifying your email address</p>
          </div>

          {/* Main Content */}
          <div className="bg-card rounded-xl shadow-xl p-8 border border-border-primary">
            {verificationStatus === 'pending' && (
              <div className="text-center space-y-6">
                <div className="spinner w-12 h-12 mx-auto"></div>
                <h3 className="text-xl font-semibold text-text-primary">
                  Verifying Your Email
                </h3>
                <p className="text-text-secondary">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
                  <div className="text-success text-6xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Email Verified Successfully!
                  </h3>
                  <p className="text-text-secondary">
                    Your email address has been verified. You can now log in to your account.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="btn btn-primary w-full"
                  >
                    Go to Login
                  </Link>
                  <Link
                    to="/"
                    className="btn btn-secondary w-full"
                  >
                    Go to Home
                  </Link>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-error/10 border border-error/20 rounded-lg">
                  <div className="text-error text-6xl mb-4">✗</div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-text-secondary">
                    The verification link is invalid or has expired. Please try again or contact support.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleResendVerification}
                    className="btn btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-5 h-5 mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                  <Link
                    to="/login"
                    className="btn btn-secondary w-full"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Need help?{' '}
              <Link to="/contact" className="text-accent hover:text-accent/80 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail; 