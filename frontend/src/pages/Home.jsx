import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const Home = () => {
  const { user, isAuthenticated, loading, validateAndRefreshToken } = useAuth();
  const [toast, setToast] = useState(null);

  const showTestToast = (type) => {
    setToast({
      type,
      message: `This is a ${type} toast notification!`
    });
  };

  const testAuth = async () => {
    try {
      const isValid = await validateAndRefreshToken();
      if (isValid) {
        setToast({
          type: 'success',
          message: 'Authentication is valid!'
        });
      } else {
        setToast({
          type: 'error',
          message: 'Authentication failed. Please log in again.'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Authentication test failed: ' + error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
                Welcome to{' '}
                <span className="gradient-text">LocalConnect+</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
                Connect with your local community, share experiences, and build meaningful relationships with your neighbors.
              </p>
              
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="btn btn-primary text-lg px-8 py-4">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-secondary text-lg px-8 py-4">
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/posts" className="btn btn-primary text-lg px-8 py-4">
                    Browse Posts
                  </Link>
                  <Link to="/posts/create" className="btn btn-accent text-lg px-8 py-4">
                    Create Post
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Why Choose LocalConnect+?
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Our platform is designed to bring communities together through meaningful interactions and shared experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="card-body">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-primary)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Community First</h3>
                  <p className="text-text-secondary">Connect with your neighbors and build lasting relationships in your local area.</p>
                </div>
              </div>

              <div className="card text-center">
                <div className="card-body">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-secondary)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Share & Engage</h3>
                  <p className="text-text-secondary">Share your experiences, ask questions, and engage in meaningful discussions.</p>
                </div>
              </div>

              <div className="card text-center">
                <div className="card-body">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-accent)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Safe & Secure</h3>
                  <p className="text-text-secondary">Your privacy and security are our top priorities. Connect with confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Section - Only show if authenticated */}
        {isAuthenticated && (
          <div className="py-8 border-t border-border-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="card">
                <div className="card-body">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Debug Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-text-secondary">User ID:</p>
                      <p className="font-mono text-sm">{user?.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Username:</p>
                      <p className="font-mono text-sm">{user?.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Email:</p>
                      <p className="font-mono text-sm">{user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Role:</p>
                      <p className="font-mono text-sm">{user?.role || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Access Token:</p>
                      <p className="font-mono text-sm text-xs">
                        {localStorage.getItem('access_token') ? 
                          localStorage.getItem('access_token').substring(0, 20) + '...' : 
                          'Not found'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Refresh Token:</p>
                      <p className="font-mono text-sm text-xs">
                        {localStorage.getItem('refresh_token') ? 
                          localStorage.getItem('refresh_token').substring(0, 20) + '...' : 
                          'Not found'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={testAuth}
                      className="btn btn-primary btn-sm"
                    >
                      Test Authentication
                    </button>
                    <button 
                      onClick={() => showTestToast('success')}
                      className="btn btn-success btn-sm"
                    >
                      Test Success Toast
                    </button>
                    <button 
                      onClick={() => showTestToast('error')}
                      className="btn btn-error btn-sm"
                    >
                      Test Error Toast
                    </button>
                    <button 
                      onClick={() => showTestToast('warning')}
                      className="btn btn-warning btn-sm"
                    >
                      Test Warning Toast
                    </button>
                    <button 
                      onClick={() => showTestToast('info')}
                      className="btn btn-accent btn-sm"
                    >
                      Test Info Toast
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Ready to Connect?
            </h2>
            <p className="text-text-secondary mb-8">
              Join thousands of users who are already building stronger communities through LocalConnect+.
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary text-lg px-8 py-4">
                Join Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home; 