import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ModeratorOnly, usePermissions } from '../components/RoleBasedUI';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Moderation = () => {
  const { user } = useAuth();
  const { isModerator } = usePermissions();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  // Redirect if not moderator
  if (!isModerator()) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h2>
              <p className="text-text-secondary mb-6">
                You don't have permission to access the moderation page. Only moderators and administrators can access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch posts and comments that need moderation
      // For now, we'll show a placeholder
      setPosts([]);
      setComments([]);
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const handleModeratePost = async (postId, action) => {
    try {
      // In a real implementation, you would call the moderation API
      toast.success(`Post ${action} successfully`);
      fetchModerationData();
    } catch (error) {
      console.error('Failed to moderate post:', error);
      toast.error('Failed to moderate post');
    }
  };

  const handleModerateComment = async (commentId, action) => {
    try {
      // In a real implementation, you would call the moderation API
      toast.success(`Comment ${action} successfully`);
      fetchModerationData();
    } catch (error) {
      console.error('Failed to moderate comment:', error);
      toast.error('Failed to moderate comment');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gradient-warning)' }}>
            <svg className="w-12 h-12 text-[var(--color-dark-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Content Moderation</h1>
          <p className="text-text-secondary">
            Review and moderate community content to maintain quality standards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">0</h3>
              <p className="text-text-secondary">Posts Pending</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">0</h3>
              <p className="text-text-secondary">Comments Pending</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">0</h3>
              <p className="text-text-secondary">Approved Today</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-error-500 to-error-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">0</h3>
              <p className="text-text-secondary">Rejected Today</p>
            </div>
          </div>
        </div>

        {/* Moderation Tabs */}
        <div className="card">
          <div className="card-body">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-[var(--color-primary)] text-[var(--color-dark-text)]'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'bg-[var(--color-primary)] text-[var(--color-dark-text)]'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                Comments ({comments.length})
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : activeTab === 'posts' ? (
              <div>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No Posts Need Moderation</h3>
                    <p className="text-text-secondary">All posts are currently approved and up to community standards.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-border-primary rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-text-primary">{post.title}</h4>
                            <p className="text-sm text-text-secondary">by {post.author.first_name} {post.author.last_name}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleModeratePost(post.id, 'approved')}
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleModeratePost(post.id, 'rejected')}
                              className="btn btn-sm btn-error"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        <p className="text-text-secondary text-sm">{post.content.substring(0, 200)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No Comments Need Moderation</h3>
                    <p className="text-text-secondary">All comments are currently approved and up to community standards.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border border-border-primary rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm text-text-secondary">by {comment.author.first_name} {comment.author.last_name}</p>
                            <p className="text-sm text-text-secondary">on post: {comment.post_title}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleModerateComment(comment.id, 'approved')}
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerateComment(comment.id, 'rejected')}
                              className="btn btn-sm btn-error"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        <p className="text-text-secondary text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moderation; 