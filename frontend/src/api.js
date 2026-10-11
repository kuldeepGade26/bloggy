import axios from 'axios';

// Configure Axios instance
// In dev: Vite proxies /api to http://localhost:5000
// In prod: Apache2 reverse proxies /api to http://localhost:5000
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send and receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if a token is in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bloggy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for handling 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      localStorage.removeItem('bloggy_token');
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data?.token) {
      localStorage.setItem('bloggy_token', res.data.token);
    }
    return res.data;
  },
  register: async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    if (res.data?.token) {
      localStorage.setItem('bloggy_token', res.data.token);
    }
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('bloggy_token');
    }
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Public Posts Endpoints
export const postsAPI = {
  getAll: async (params = {}) => {
    const res = await api.get('/posts', { params });
    return res.data;
  },
  getBySlug: async (slug) => {
    const res = await api.get(`/posts/${slug}`);
    return res.data;
  },
};

// Admin Endpoints
export const adminAPI = {
  getAllPosts: async () => {
    const res = await api.get('/admin/posts');
    return res.data;
  },
  getPostById: async (id) => {
    const res = await api.get(`/admin/posts/${id}`);
    return res.data;
  },
  createPost: async (postData) => {
    const res = await api.post('/admin/posts', postData);
    return res.data;
  },
  updatePost: async (id, postData) => {
    const res = await api.put(`/admin/posts/${id}`, postData);
    return res.data;
  },
  toggleStatus: async (id, status) => {
    const res = await api.patch(`/admin/posts/${id}/status`, { status });
    return res.data;
  },
  deletePost: async (id) => {
    const res = await api.delete(`/admin/posts/${id}`);
    return res.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default api;
