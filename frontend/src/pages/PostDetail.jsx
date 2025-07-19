import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI, commentsAPI } from '../services/api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(null);

  useEffect(() => {
    // Check if ID is valid (numeric)
    if (!id || isNaN(parseInt(id))) {
      setError('Invalid post ID');
      setLoading(false);
      return;
    }
    
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      setPost(response.data);
    } catch (err) {
      setError('Failed to load post. Please try again.');
      console.error('Error fetching post:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getCommentsByPost(id);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await commentsAPI.createComment({
        post: id,
        content: newComment.trim()
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      setError('Failed to post comment. Please try again.');
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId, content) => {
    try {
      setSubmitting(true);
      await commentsAPI.createComment({
        post: id,
        parent: parentId,
        content: content.trim()
      });
      setShowReplyForm(null);
      fetchComments();
    } catch (err) {
      setError('Failed to post reply. Please try again.');
      console.error('Error posting reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.deletePost(id);
      navigate('/posts');
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment, depth = 0) => {
    const canEdit = user?.id === comment.author?.id || user?.role === 'ADMIN';
    const canDelete = user?.id === comment.author?.id || user?.role === 'ADMIN';

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-6 border-l-2 border-border-primary pl-4' : ''}`}>
        <div className="card mb-4">
          <div className="card-body">
            {/* Comment Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <span className="text-white font-medium text-xs">
                    {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-text-primary text-sm">
                    {comment.author?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {canEdit && (
                  <button className="text-xs text-text-tertiary hover:text-text-primary transition-colors">
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button className="text-xs text-error-500 hover:text-error-600 transition-colors">
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Comment Content */}
            <div className="mb-3">
              <p className="text-text-primary">{comment.content}</p>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowReplyForm(showReplyForm === comment.id ? null : comment.id)}
                  className="text-xs text-text-tertiary hover:text-text-primary transition-colors flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
                {comment.reply_count > 0 && (
                  <span className="text-xs text-text-tertiary">
                    {comment.reply_count} replies
                  </span>
                )}
              </div>
            </div>

            {/* Reply Form */}
            {showReplyForm === comment.id && (
              <div className="mt-4 pt-4 border-t border-border-primary">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const content = e.target.content.value;
                  if (content.trim()) {
                    handleSubmitReply(comment.id, content);
                    e.target.content.value = '';
                  }
                }}>
                  <div className="form-group">
                    <textarea
                      name="content"
                      className="form-input"
                      placeholder="Write a reply..."
                      rows="3"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary btn-sm"
                    >
                      {submitting ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Loading post..." />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="card-body">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Post Not Found</h2>
              <p className="text-text-secondary mb-6">The post you're looking for doesn't exist or has been removed.</p>
              <Link to="/posts" className="btn btn-primary">
                Back to Posts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <Toast type="error" message={error} />
          </div>
        )}

        {/* Post Header */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <span className="text-white font-medium text-lg">
                    {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                    {post.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-text-tertiary">
                    <span>By {post.author?.username || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {post.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(post.status)}`}>
                  {getStatusText(post.status)}
                </span>
                {(user?.id === post.author?.id || user?.role === 'ADMIN') && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/posts/${post.id}/edit`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={handleDeletePost}
                      className="btn btn-error btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </div>

            {/* Post Meta */}
            <div className="flex items-center justify-between pt-6 border-t border-border-primary">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-bg-secondary rounded-full text-sm font-medium text-text-secondary">
                  {post.category}
                </span>
                <div className="flex items-center text-sm text-text-tertiary">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {comments.length} comments
                </div>
              </div>
              <Link to="/posts" className="btn btn-secondary btn-sm">
                Back to Posts
              </Link>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-xl font-semibold text-text-primary mb-6">
              Comments ({comments.length})
            </h3>

            {/* New Comment Form */}
            {user && (
              <div className="mb-8 p-6 bg-bg-secondary rounded-lg">
                <form onSubmit={handleSubmitComment}>
                  <div className="form-group">
                    <label className="form-label">Add a comment</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="form-input"
                      placeholder="Share your thoughts..."
                      rows="4"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="btn btn-primary"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-text-secondary">
                    {user ? 'Be the first to comment on this post!' : 'Sign in to leave a comment.'}
                  </p>
                </div>
              ) : (
                comments.map(comment => renderComment(comment))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 