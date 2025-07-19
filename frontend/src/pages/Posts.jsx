import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import { handleApiError } from '../utils/apiUtils';
import Toast from '../components/Toast';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    date_range: '',
    time_period: '',
    min_comments: '',
    location: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const { user } = useAuth();

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500); // 500ms delay

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters.search]);

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [debouncedSearch, filters.category, filters.status, filters.date_range, filters.time_period, filters.min_comments, filters.location]);

  // Fetch categories and statuses on component mount
  useEffect(() => {
    fetchCategories();
    fetchStatuses();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearch,
        category: filters.category,
        status: filters.status,
        date_range: filters.date_range,
        time_period: filters.time_period,
        min_comments: filters.min_comments,
        location: filters.location
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await postsAPI.getAllPosts(params);
      setPosts(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await postsAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await postsAPI.getStatuses();
      setStatuses(response.data);
    } catch (err) {
      console.error('Error fetching statuses:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      date_range: '',
      time_period: '',
      min_comments: '',
      location: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-success-500';
      case 'IN_PROGRESS': return 'bg-warning-500';
      case 'CLOSED': return 'bg-error-500';
      case 'RESOLVED': return 'bg-primary-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN': return 'Open';
      case 'IN_PROGRESS': return 'In Progress';
      case 'CLOSED': return 'Closed';
      case 'RESOLVED': return 'Resolved';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Posts</h1>
          <p className="text-text-secondary">Find and connect with your local community</p>
        </div>
        {user && (
          <Link
            to="/posts/create"
            className="btn btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Post</span>
          </Link>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="card mb-8">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Time Period
              </label>
              <select
                value={filters.time_period}
                onChange={(e) => handleFilterChange('time_period', e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Min Comments */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Min Comments
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.min_comments}
                onChange={(e) => handleFilterChange('min_comments', e.target.value)}
                className="input input-bordered w-full"
                min="0"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-text-secondary">
          {posts.length} post{posts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Posts Grid */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {posts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No posts found</h3>
          <p className="text-text-secondary mb-6">Try adjusting your filters or create the first post!</p>
          {user && (
            <Link to="/posts/create" className="btn btn-primary">
              Create First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                      <span className="text-white font-medium">
                        {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {post.author?.username || 'Anonymous'}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(post.status)} text-white text-xs`}>
                    {getStatusText(post.status)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                  <Link to={`/posts/${post.id}`} className="hover:text-primary-500 transition-colors">
                    {post.title}
                  </Link>
                </h3>

                <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comment_count || 0}
                    </span>
                    {post.location && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.location}
                      </span>
                    )}
                  </div>
                  {post.category && (
                    <span className="badge badge-outline text-xs">
                      {post.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for subsequent loads */}
      {loading && posts.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Posts; 