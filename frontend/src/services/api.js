import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Request data:', config.data);
    
    // Set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    
    const originalRequest = error.config;

    // Only handle 401 errors and avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } else {
          // No refresh token available, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          return Promise.reject(error);
        }
      } catch {
        // Token refresh failed, clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/accounts/register/', userData),
  login: (credentials) => api.post('/accounts/login/', credentials),
  logout: (refreshToken) => api.post('/accounts/logout/', { refresh_token: refreshToken }),
  refreshToken: (refreshToken) => api.post('/accounts/token/refresh/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/accounts/current-user/'),
  updateProfile: (userData) => api.put('/accounts/profile/update/', userData),
  changePassword: (passwordData) => api.post('/accounts/change-password/', passwordData),
  verifyEmail: (token) => api.post('/accounts/verify-email/', { token }),
  requestPasswordReset: (email) => api.post('/accounts/request-password-reset/', { email }),
  resetPassword: (data) => api.post('/accounts/reset-password/', data),
};

// Posts API
export const postsAPI = {
  getAllPosts: (params) => api.get('/posts/', { params }),
  getPost: (id) => api.get(`/posts/${id}/`),
  createPost: (postData) => api.post('/posts/', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}/`, postData),
  deletePost: (id) => api.delete(`/posts/${id}/`),
  closePost: (id) => api.post(`/posts/${id}/close/`),
  reopenPost: (id) => api.post(`/posts/${id}/reopen/`),
  getCategories: () => api.get('/posts/categories/'),
  getStatuses: () => api.get('/posts/statuses/'),
  getSearchSuggestions: (query) => api.get('/posts/search_suggestions/', { params: { q: query } }),
  getStatistics: () => api.get('/posts/statistics/'),
};

// Comments API
export const commentsAPI = {
  getAllComments: (params) => api.get('/comments/', { params }),
  getComment: (id) => api.get(`/comments/${id}/`),
  createComment: (commentData) => api.post('/comments/', commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}/`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}/`),
  getCommentsByPost: (postId) => api.get('/comments/by_post/', { params: { post_id: postId } }),
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies/`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications/', { params }),
  getNotification: (id) => api.get(`/notifications/${id}/`),
  createNotification: (notificationData) => api.post('/notifications/', notificationData),
  updateNotification: (id, notificationData) => api.put(`/notifications/${id}/`, notificationData),
  deleteNotification: (id) => api.delete(`/notifications/${id}/`),
  getUnreadNotifications: () => api.get('/notifications/unread/'),
  getNotificationSummary: () => api.get('/notifications/summary/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark_as_read/`),
  markAsUnread: (id) => api.post(`/notifications/${id}/mark_as_unread/`),
  markAllAsRead: () => api.post('/notifications/mark_all_as_read/'),
  markAllAsUnread: () => api.post('/notifications/mark_all_as_unread/'),
  clearAllNotifications: () => api.delete('/notifications/clear_all/'),
  getNotificationsByType: (type) => api.get('/notifications/by_type/', { params: { type } }),
  searchNotifications: (query) => api.get('/notifications/search/', { params: { q: query } }),
};

// Admin API
export const adminAPI = {
  getAllUsers: (params) => api.get('/accounts/admin/users/', { params }),
  getUserDetail: (id) => api.get(`/accounts/admin/users/${id}/`),
  updateUser: (id, userData) => api.put(`/accounts/admin/users/${id}/`, userData),
};

export default api; 