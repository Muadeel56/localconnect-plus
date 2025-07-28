import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import Toast from '../components/Toast';
import CustomSelect from '../components/CustomSelect';
import Avatar from '../components/Avatar';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  const searchRef = useRef(null);

  const { user } = useAuth();

  // Click outside handler for search suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Fetch search suggestions
  useEffect(() => {
    if (filters.search && filters.search.length >= 2) {
      fetchSearchSuggestions(filters.search);
    } else {
      setSearchSuggestions([]);
    }
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
      // Handle both array and paginated response formats
      const postsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setPosts(postsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchSuggestions = async (query) => {
    try {
      const response = await postsAPI.getSearchSuggestions(query);
      setSearchSuggestions(response.data);
    } catch (err) {
      console.error('Error fetching search suggestions:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await postsAPI.getCategories();
      setCategories(response.data.map(cat => cat.name));
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await postsAPI.getStatuses();
      setStatuses(response.data.map(status => ({ value: status.id, label: status.name })));
    } catch (err) {
      console.error('Error fetching statuses:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSuggestionClick = (suggestion) => {
    handleFilterChange('search', suggestion);
    setShowSuggestions(false);
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
    const colorMap = {
      'published': 'bg-green-500',
      'draft': 'bg-yellow-500',
      'pending': 'bg-blue-500',
      'rejected': 'bg-red-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const textMap = {
      'published': 'Published',
      'draft': 'Draft',
      'pending': 'Pending',
      'rejected': 'Rejected'
    };
    return textMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };



  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-12">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">Posts</h1>
          <p className="text-sm sm:text-base text-text-secondary">Find and connect with your local community</p>
        </div>
        {user && (
          <Link
            to="/posts/create"
            className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm sm:text-base">Create Post</span>
          </Link>
        )}
      </div>

      {/* Quick Search Bar */}
      <div className="card mb-6 sm:mb-8">
        <div className="card-body p-4 sm:p-6">
          <div className="relative" ref={searchRef}>
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-tertiary absolute left-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Quick search posts, categories, or locations..."
                value={filters.search}
                onChange={(e) => {
                  handleFilterChange('search', e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="input input-bordered w-full pl-10 pr-10 sm:pr-12 text-sm sm:text-base"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 text-text-tertiary hover:text-text-primary"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto" ref={searchRef}>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-[var(--color-background-hover)] transition-colors text-sm sm:text-base"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-text-primary">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="card mb-6 sm:mb-8">
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="btn btn-outline btn-sm w-full sm:w-auto"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Category
              </label>
              <CustomSelect
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                options={categories.map(cat => ({ value: cat, label: cat }))}
                placeholder="All Categories"
                className="w-full"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <CustomSelect
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                options={statuses.map(status => ({ value: status.value, label: status.label }))}
                placeholder="All Statuses"
                className="w-full"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Date Range
              </label>
              <select
                value={filters.date_range}
                onChange={(e) => handleFilterChange('date_range', e.target.value)}
                className="form-input w-full text-sm sm:text-base"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

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
                className="form-input w-full text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="card-body text-center">
            <p className="text-text-secondary">Error loading posts: {error}</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <p className="text-text-secondary">No posts found matching your criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {posts.map((post) => (
            <div key={post.id} className="card hover:transform hover:scale-105 transition-all duration-300">
              <div className="card-body p-4 sm:p-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                    {getStatusText(post.status)}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 line-clamp-2">
                  {filters.search ? (
                    <span dangerouslySetInnerHTML={{ 
                      __html: highlightSearchTerm(post.title, filters.search) 
                    }} />
                  ) : (
                    post.title
                  )}
                </h3>
                

                
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                  <span className="px-2 py-1 bg-bg-secondary rounded-full text-xs text-text-secondary">
                    {post.category}
                  </span>
                  {post.location && (
                    <span className="px-2 py-1 bg-bg-secondary rounded-full text-xs text-text-secondary">
                      📍 {post.location}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-xs text-text-tertiary">
                  <span>By {post.author.first_name} {post.author.last_name}</span>
                  <span>{post.comment_count} comments</span>
                </div>
                
                <div className="mt-4 sm:mt-6 flex gap-2">
                  <Link
                    to={`/posts/${post.id}`}
                    className="btn btn-primary btn-sm flex-1 text-center"
                  >
                    View Details
                  </Link>
                  {user && (user.id === post.author.id || user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                    <Link
                      to={`/posts/${post.id}/edit`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts; 