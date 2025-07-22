import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.old_password) {
      newErrors.old_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    if (!passwordData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setChangingPassword(true);
    
    try {
      await authAPI.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        new_password2: passwordData.confirm_password
      });
      
      setSuccess('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to change password. Please try again.');
      console.error('Error changing password:', err);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleCancelPassword = () => {
    setShowChangePassword(false);
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordErrors({});
    setError(null);
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'VOLUNTEER': return 'Volunteer';
      case 'USER': return 'User';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-error-500';
      case 'VOLUNTEER': return 'bg-warning-500';
      case 'USER': return 'bg-primary-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="card-body">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Sign In Required</h2>
              <p className="text-text-secondary mb-6">You need to be signed in to view your profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gradient-primary)' }}>
            <span className="text-white font-bold text-2xl">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            My Profile
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Manage your account information and preferences
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-8">
            <Toast type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}
        {success && (
          <div className="mb-8">
            <Toast type="success" message={success} onClose={() => setSuccess(null)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gradient-primary)' }}>
                  <span className="text-white font-bold text-4xl">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {user.username}
                </h2>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getRoleColor(user.role)} mb-4 inline-block`}>
                  {getRoleDisplay(user.role)}
                </span>
                
                <div className="space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  
                  {user.email_verified && (
                    <div className="flex items-center justify-center text-success-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Email Verified
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-primary">
                    Profile Information
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    {/* First Name */}
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Last Name */}
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isEditing}
                        placeholder="+1234567890"
                      />
                    </div>

                    {/* Location */}
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isEditing}
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={!isEditing}
                      rows="4"
                      placeholder="Tell us about yourself..."
                      maxLength="500"
                    />
                    <p className="text-sm text-text-tertiary mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  {/* Form Actions */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border-primary">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary flex-1"
                      >
                        {saving ? (
                          <>
                            <Loading text="Saving..." />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Account Actions */}
            <div className="card mt-8">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Account Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowChangePassword(true)}
                    className="btn btn-secondary w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </button>
                  <button className="btn btn-secondary w-full">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Modal */}
            {showChangePassword && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-bg-secondary rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-text-primary">
                      Change Password
                    </h3>
                    <button
                      onClick={handleCancelPassword}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="old_password"
                        value={passwordData.old_password}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          passwordErrors.old_password
                            ? 'border-error bg-error/10 text-error'
                            : 'border-border bg-bg-primary text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20'
                        }`}
                        placeholder="Enter current password"
                        disabled={changingPassword}
                      />
                      {passwordErrors.old_password && (
                        <p className="mt-1 text-sm text-error">{passwordErrors.old_password}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          passwordErrors.new_password
                            ? 'border-error bg-error/10 text-error'
                            : 'border-border bg-bg-primary text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20'
                        }`}
                        placeholder="Enter new password"
                        disabled={changingPassword}
                      />
                      {passwordErrors.new_password && (
                        <p className="mt-1 text-sm text-error">{passwordErrors.new_password}</p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          passwordErrors.confirm_password
                            ? 'border-error bg-error/10 text-error'
                            : 'border-border bg-bg-primary text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20'
                        }`}
                        placeholder="Confirm new password"
                        disabled={changingPassword}
                      />
                      {passwordErrors.confirm_password && (
                        <p className="mt-1 text-sm text-error">{passwordErrors.confirm_password}</p>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="btn btn-primary flex-1"
                      >
                        {changingPassword ? (
                          <div className="flex items-center justify-center">
                            <div className="spinner w-4 h-4 mr-2"></div>
                            Changing...
                          </div>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPassword}
                        className="btn btn-secondary flex-1"
                        disabled={changingPassword}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 