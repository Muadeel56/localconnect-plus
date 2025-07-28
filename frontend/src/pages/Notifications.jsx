import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import CustomSelect from '../components/CustomSelect';

const Notifications = () => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();
  
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setToast({ type: 'success', message: 'Notification marked as read' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to mark notification as read' });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setToast({ type: 'success', message: 'Notification deleted' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete notification' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setToast({ type: 'success', message: 'All notifications marked as read' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to mark all notifications as read' });
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      try {
        await clearAllNotifications();
        setToast({ type: 'success', message: 'All notifications cleared' });
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to clear notifications' });
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) return;

    try {
      if (action === 'mark-read') {
        await Promise.all(selectedNotifications.map(id => markAsRead(id)));
        setToast({ type: 'success', message: `${selectedNotifications.length} notifications marked as read` });
      } else if (action === 'delete') {
        await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
        setToast({ type: 'success', message: `${selectedNotifications.length} notifications deleted` });
      }
      setSelectedNotifications([]);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to perform bulk action' });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COMMENT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'REPLY':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      case 'POST_STATUS':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'MENTION':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'ADMIN':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V5H4v6zM10 5h6V5h-6v6zM10 19h6v-6h-6v6z" />
          </svg>
        );
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.data?.post_id) {
      return `/posts/${notification.data.post_id}`;
    }
    return '#';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Notifications</h1>
          <p className="text-text-secondary">
            {unreadCount} unread • {notifications.length} total
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <CustomSelect
            value={filter}
            onChange={(value) => setFilter(value)}
            options={[
              { value: 'all', label: 'All Notifications' },
              { value: 'unread', label: 'Unread Only' },
              { value: 'read', label: 'Read Only' },
            ]}
            className="w-48"
            size="sm"
          />
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-secondary btn-sm"
            >
              Mark All Read
            </button>
          )}
          
          <button
            onClick={handleClearAll}
            className="btn btn-error btn-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('mark-read')}
                  className="btn btn-secondary btn-sm"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="btn btn-error btn-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedNotifications([])}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No notifications</h3>
          <p className="text-text-secondary mb-6">
            {filter === 'all' 
              ? "You don't have any notifications yet."
              : filter === 'unread'
              ? "You don't have any unread notifications."
              : "You don't have any read notifications."
            }
          </p>
          <Link to="/posts" className="btn btn-primary">
            Browse Posts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card hover:shadow-lg transition-all duration-200 ${
                !notification.is_read ? 'border-l-4 border-l-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10' : ''
              }`}
            >
              <div className="card-body">
                <div className="flex items-start space-x-4">
                  {/* Checkbox for bulk selection */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="checkbox checkbox-primary mt-1"
                  />

                  {/* Notification Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.is_read ? 'bg-[var(--color-primary)] text-[var(--color-dark-text)]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                  }`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={getNotificationLink(notification)}
                      onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                      className="block"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.is_read ? 'text-text-primary' : 'text-text-secondary'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-text-tertiary mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-text-tertiary">
                              {notification.time_ago}
                            </span>
                            <span className={`badge badge-sm ${
                              !notification.is_read ? 'badge-primary' : 'badge-outline'
                            }`}>
                              {notification.notification_type_display}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn btn-ghost btn-sm"
                        title="Mark as read"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="btn btn-ghost btn-sm text-error-500 hover:text-error-600"
                      title="Delete notification"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

export default Notifications; 