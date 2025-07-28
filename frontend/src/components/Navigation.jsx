import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import { AdminOnly, ModeratorOnly, AuthenticatedOnly } from './RoleBasedUI';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    // Redirect to login page after logout
    navigate('/login');
  };

  return (
    <>
    <nav className="bg-bg-card border-b border-border-primary shadow-sm sticky top-0 z-50 backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110" style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-[var(--color-dark-text)] font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">LocalConnect+</span>
            <span className="text-lg font-bold gradient-text sm:hidden">LC+</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/posts"
              className={`nav-link ${isActive('/posts') ? 'active' : ''}`}
            >
              Posts
            </Link>
            
            <AuthenticatedOnly>
              <Link
                to="/comments"
                className={`nav-link ${isActive('/comments') ? 'active' : ''}`}
              >
                Comments
              </Link>
            </AuthenticatedOnly>
            
            <AuthenticatedOnly>
              <Link
                to="/notifications"
                className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}
              >
                Notifications
              </Link>
            </AuthenticatedOnly>
            
            <ModeratorOnly>
              <Link
                to="/moderation"
                className={`nav-link ${isActive('/moderation') ? 'active' : ''}`}
              >
                Moderation
              </Link>
            </ModeratorOnly>
            
            <AdminOnly>
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Admin
              </Link>
            </AdminOnly>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Bell */}
            <AuthenticatedOnly>
              <NotificationBell />
            </AuthenticatedOnly>
            


            {/* User Menu */}
            {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    className="flex items-center space-x-2 p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-all duration-300 focus:outline-none focus:ring-2" 
                    style={{ '--tw-ring-color': 'var(--primary-500)' }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <Avatar user={user} size="sm" />
                    <span className="hidden lg:block text-sm font-medium text-text-primary">
                      {user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 'User'}
                  </span>
                  <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border-primary rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-text-secondary border-b border-border-primary">
                          <div className="font-medium text-text-primary">{user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 'User'}</div>
                      <div className="text-xs capitalize">{user.role}</div>
                          {!user.email_verified && (
                            <div className="text-xs text-red-500 mt-1 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Email not verified
                            </div>
                          )}
                      {user.permissions && (
                        <div className="text-xs text-text-tertiary mt-1">
                          {Object.keys(user.permissions).filter(p => user.permissions[p]).length} permissions
                        </div>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    
                    <ModeratorOnly>
                      <Link
                        to="/moderation"
                        className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors duration-200"
                            onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Moderation
                      </Link>
                    </ModeratorOnly>
                    
                    <AdminOnly>
                      <Link
                        to="/admin"
                        className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors duration-200"
                            onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Link>
                    </AdminOnly>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
                  )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/register"
                  className="btn btn-secondary text-sm hidden sm:inline-flex"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="btn btn-primary text-sm"
                >
                  Sign In
                </Link>
              </div>
            )}

          {/* Mobile Menu Button */}
          <button 
                className="md:hidden p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-all duration-300 focus:outline-none focus:ring-2" 
            style={{ '--tw-ring-color': 'var(--primary-500)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - Semi-transparent background with solid content */}
      <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Semi-transparent background */}
        <div className="absolute inset-0 bg-bg-card bg-opacity-40 backdrop-blur-sm" />
        
        {/* Solid content container */}
        <div className="relative h-full flex flex-col bg-bg-card bg-opacity-95 shadow-2xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-primary">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <span className="text-[var(--color-dark-text)] font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold gradient-text">LocalConnect+</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {/* User Info Section */}
              {user && (
                <div className="p-4 bg-bg-secondary rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <Avatar user={user} size="lg" />
                    <div>
                      <div className="font-semibold text-text-primary">{user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase()}</div>
                      <div className="text-sm text-text-secondary capitalize">{user.role}</div>
                      {!user.email_verified && (
                        <div className="text-xs text-red-500 mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Email not verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <Link
                to="/"
                className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                  isActive('/') ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>

              <Link
                to="/posts"
                className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                  isActive('/posts') ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>Posts</span>
              </Link>
              
              <AuthenticatedOnly>
                <Link
                  to="/comments"
                  className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    isActive('/comments') ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Comments</span>
                </Link>
              </AuthenticatedOnly>
              
              <AuthenticatedOnly>
                <Link
                  to="/notifications"
                  className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    isActive('/notifications') ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V5H4v6zM10 5h6V5h-6v6zM10 19h6v-6h-6v6z" />
                  </svg>
                  <span>Notifications</span>
                </Link>
              </AuthenticatedOnly>
              
              <ModeratorOnly>
                <Link
                  to="/moderation"
                  className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    isActive('/moderation') ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Moderation</span>
                </Link>
              </ModeratorOnly>
              
              <AuthenticatedOnly>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    isActive('/profile') ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>
              </AuthenticatedOnly>
              
              <AdminOnly>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    isActive('/admin') ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin</span>
                </Link>
              </AdminOnly>
            </div>
          </div>
              
          {/* Drawer Footer */}
          <div className="p-4 border-t border-border-primary">
            {user ? (
                <button
                  onClick={handleLogout}
                className="flex items-center space-x-3 p-4 rounded-lg text-text-primary hover:bg-bg-secondary transition-colors w-full"
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                <span>Logout</span>
                </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="btn btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-secondary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation; 