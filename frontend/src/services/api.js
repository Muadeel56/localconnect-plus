import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
};

// Comments API
export const commentsAPI = {
  getAllComments: (params) => api.get('/comments/', { params }),
  getComment: (id) => api.get(`/comments/${id}/`),
  createComment: (commentData) => api.post('/comments/', commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}/`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}/`),
  getReplies: (id) => api.get(`/comments/${id}/replies/`),
  getCommentsByPost: (postId) => api.get(`/comments/by_post/?post_id=${postId}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: (params) => api.get('/accounts/admin/users/', { params }),
  getUserDetail: (id) => api.get(`/accounts/admin/users/${id}/`),
  updateUser: (id, userData) => api.put(`/accounts/admin/users/${id}/`, userData),
};

export default api; 