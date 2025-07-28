import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import Avatar from '../components/Avatar';

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
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  useEffect(() => {
    if (user) {
      console.log('Profile component - user data:', user);
      console.log('Profile component - profile_picture:', user.profile_picture);
      
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || ''
      });
      setProfilePicturePreview(user.profile_picture);
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
      const response = await authAPI.changePassword(passwordData);
      setSuccess('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setShowChangePassword(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
      setSaving(true);
      setError(null);
    setSuccess(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Add profile picture if selected
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }
      
      // Add other form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await authAPI.updateProfile(formDataToSend);
      
      console.log('Profile update response:', response.data);
      
      // Update user context with new data
      updateUser(response.data);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setProfilePicture(null);
    } catch (error) {
      console.error('Profile update error:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errorMessages = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
            } else if (typeof errorData[field] === 'string') {
              errorMessages.push(errorData[field]);
            }
          });
          setError(errorMessages.join('\n'));
        } else {
          setError(errorData);
        }
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicturePreview(user.profile_picture);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || ''
    });
  };

  const handleCancelPassword = () => {
    setShowChangePassword(false);
    setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    setPasswordErrors({});
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'ADMIN': 'Administrator',
      'VOLUNTEER': 'Volunteer',
      'USER': 'User'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'ADMIN': 'bg-red-500',
      'VOLUNTEER': 'bg-blue-500',
      'USER': 'bg-green-500'
    };
    return colorMap[role] || 'bg-gray-500';
  };

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <>
      {/* Toast Notifications */}
      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError(null)}
          duration={5000}
        />
      )}
      
      {success && (
        <Toast
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
          duration={5000}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">My Profile</h1>
          <p className="text-text-secondary text-lg">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-body text-center">
                {/* Profile Picture Section */}
                <div className="mb-6">
                  <div className="relative inline-block">
                    <Avatar user={user} size="3xl" />
                    
                    {isEditing && (
                      <div className="absolute bottom-0 right-0">
                        <label htmlFor="profile-picture" className="cursor-pointer">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </label>
                        <input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  
                  {profilePicturePreview && profilePicturePreview !== user.profile_picture && (
                    <div className="mt-2 text-xs text-text-secondary">
                      Preview of new profile picture
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase()}
                </h2>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-[var(--color-dark-text)] ${getRoleColor(user.role)} mb-4 inline-block`}>
                  {getRoleDisplay(user.role)}
                </span>
                
                <div className="space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
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
                      maxLength="500"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="text-xs text-text-secondary mt-1">
                      {formData.bio.length}/500 characters
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex items-center space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                      >
                        {saving ? (
                          <div className="flex items-center">
                            <div className="spinner w-4 h-4 mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Account Actions */}
            <div className="card mt-6">
              <div className="card-body">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Account Actions
                </h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowChangePassword(true)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border-primary hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="text-text-primary">Change Password</span>
                    </div>
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border-primary hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-text-primary">Email Settings</span>
                    </div>
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
                </div>
              </div>
            </div>

            {/* Change Password Modal */}
            {showChangePassword && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'var(--bg-overlay)' }}>
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Change Password
                    </h3>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                  <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        name="old_password"
                        value={passwordData.old_password}
                        onChange={handlePasswordChange}
                    className="form-input"
                    required
                      />
                      {passwordErrors.old_password && (
                    <p className="text-error text-sm mt-1">{passwordErrors.old_password}</p>
                      )}
                    </div>

                    <div>
                  <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                    className="form-input"
                    required
                      />
                      {passwordErrors.new_password && (
                    <p className="text-error text-sm mt-1">{passwordErrors.new_password}</p>
                      )}
                    </div>

                    <div>
                  <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                    className="form-input"
                    required
                      />
                      {passwordErrors.confirm_password && (
                    <p className="text-error text-sm mt-1">{passwordErrors.confirm_password}</p>
                      )}
                    </div>

                <div className="flex items-center space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="btn btn-primary flex-1"
                      >
                        {changingPassword ? (
                      <div className="flex items-center">
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
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile; 