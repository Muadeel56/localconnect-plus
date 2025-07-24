import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    location: '',
    status: 'OPEN'
  });

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

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      const postData = response.data;
      
      // Check if user can edit this post
      if (postData.author?.id !== user?.id && user?.role !== 'ADMIN') {
        setError('You do not have permission to edit this post.');
        return;
      }
      
      setPost(postData);
      setFormData({
        title: postData.title || '',
        content: postData.content || '',
        category: postData.category || 'GENERAL',
        location: postData.location || '',
        status: postData.status || 'OPEN'
      });
    } catch (err) {
      setError('Failed to load post. Please try again.');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
      setError(null);
      
      await postsAPI.updatePost(id, formData);
      
      // Redirect to the post detail page
      navigate(`/posts/${id}`);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post. Please try again.');
      console.error('Error updating post:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/posts/${id}`);
  };

  if (loading) {
    return <Loading fullScreen text="Loading post..." />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="card-body">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Post Not Found</h2>
              <p className="text-text-secondary mb-6">The post you're trying to edit doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/posts')}
                className="btn btn-primary"
              >
                Back to Posts
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
            <svg className="w-12 h-12 text-[var(--color-dark-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Edit Post
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Update your post information
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <Toast type="error" message={error} />
          </div>
        )}

        {/* Edit Post Form */}
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
            </form>
          </div>
        </div>

        {/* Post Info */}
        <div className="card mt-8">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Post Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-text-secondary">Author:</span>
                <span className="ml-2 text-text-primary">{post.author?.username}</span>
              </div>
              <div>
                <span className="font-medium text-text-secondary">Created:</span>
                <span className="ml-2 text-text-primary">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-text-secondary">Last Updated:</span>
                <span className="ml-2 text-text-primary">
                  {new Date(post.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-text-secondary">Comments:</span>
                <span className="ml-2 text-text-primary">{post.comment_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost; 