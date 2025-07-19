import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    location: '',
    status: 'OPEN'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const categories = [
    { value: 'GENERAL', label: 'General' },
    { value: 'FOOD', label: 'Food & Groceries' },
    { value: 'TRANSPORT', label: 'Transportation' },
    { value: 'MEDICAL', label: 'Medical & Health' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statuses = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'RESOLVED', label: 'Resolved' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (formData.title.length < 10) {
      setError('Title must be at least 10 characters long');
      return false;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    if (formData.content.length < 20) {
      setError('Content must be at least 20 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await postsAPI.createPost(formData);
      setSuccess('Post created successfully!');
      
      // Redirect to the new post after a short delay
      setTimeout(() => {
        navigate(`/posts/${response.data.id}`);
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="card-body">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Sign In Required</h2>
              <p className="text-text-secondary mb-6">You need to be signed in to create a post.</p>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Sign In
              </button>
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
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Create a Post
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Share something with your local community
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-8">
            <Toast type="error" message={error} />
          </div>
        )}
        {success && (
          <div className="mb-8">
            <Toast type="success" message={success} />
          </div>
        )}

        {/* Create Post Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  Title <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter a descriptive title for your post..."
                  minLength="10"
                  maxLength="200"
                  required
                />
                <p className="text-sm text-text-tertiary mt-1">
                  Minimum 10 characters. Current: {formData.title.length}/200
                </p>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">
                  Category <span className="text-error-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div className="form-group">
                <label className="form-label">
                  Content <span className="text-error-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Share your thoughts, ask for help, or start a discussion..."
                  rows="8"
                  minLength="20"
                  required
                />
                <p className="text-sm text-text-tertiary mt-1">
                  Minimum 20 characters. Current: {formData.content.length}
                </p>
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
                  placeholder="Enter a location relevant to your post (optional)"
                  maxLength="100"
                />
                <p className="text-sm text-text-tertiary mt-1">
                  Help others understand where this post is relevant
                </p>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">
                  Status <span className="text-error-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-text-tertiary mt-1">
                  Choose the current status of your post
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border-primary">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <>
                      <Loading text="Creating..." />
                      Creating Post...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Post
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/posts')}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tips Section */}
        <div className="card mt-8">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Tips for a Great Post
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Be Clear and Specific</h4>
                  <p className="text-sm text-text-secondary">Use a descriptive title and provide enough detail for others to understand your post.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Choose the Right Category</h4>
                  <p className="text-sm text-text-secondary">Select the most appropriate category to help others find your post.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Include Location if Relevant</h4>
                  <p className="text-sm text-text-secondary">Add a location if your post is specific to a particular area.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Be Respectful</h4>
                  <p className="text-sm text-text-secondary">Remember that your post will be visible to the entire community.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost; 