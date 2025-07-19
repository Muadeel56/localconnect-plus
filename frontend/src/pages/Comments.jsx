import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { commentsAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const Comments = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    author: '',
    post: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [filters]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.author) params.author = filters.author;
      if (filters.post) params.post = filters.post;

      const response = await commentsAPI.getAllComments(params);
      setComments(response.data.results || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load comments. Please try again.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      author: '',
      post: ''
    });
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsAPI.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      setError('Failed to delete comment. Please try again.');
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const canModerate = user?.role === 'ADMIN' || user?.role === 'VOLUNTEER';

  if (loading) {
    return <Loading fullScreen text="Loading comments..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gradient-accent)' }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Community Comments
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            View and manage comments across all posts
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
            <Link to="/posts" className="btn btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              View Posts
            </Link>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card mb-8 animate-fade-in">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="form-group">
                  <label className="form-label">Search Comments</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search comment content..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                {/* Author Filter */}
                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Filter by author..."
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                  />
                </div>

                {/* Clear Filters */}
                <div className="form-group flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <Toast type="error" message={error} />
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="card max-w-2xl mx-auto">
            <div className="card-body text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                No Comments Found
              </h2>
              <p className="text-text-secondary mb-8">
                {filters.search || filters.author 
                  ? 'Try adjusting your filters to see more comments.'
                  : 'No comments have been posted yet.'
                }
              </p>
              <Link to="/posts" className="btn btn-primary">
                View Posts
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="card">
                <div className="card-body">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
                        <span className="text-white font-medium text-sm">
                          {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {comment.author?.username || 'Anonymous'}
                        </p>
                        <p className="text-sm text-text-tertiary">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(user?.id === comment.author?.id || canModerate) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-error-500 hover:text-error-600 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-4">
                    <p className="text-text-primary whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>

                  {/* Comment Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                    <div className="flex items-center space-x-4">
                      {comment.parent && (
                        <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-1 rounded">
                          Reply to comment #{comment.parent}
                        </span>
                      )}
                      {comment.reply_count > 0 && (
                        <span className="text-xs text-text-tertiary">
                          {comment.reply_count} replies
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/posts/${comment.post}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View Post
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments; 