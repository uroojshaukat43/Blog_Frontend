import axios from 'axios';
import api from "../services/api";

// Use relative path for API - always use same origin as frontend
// This works when frontend is served from backend on the same port
// If you're using IIS, you'll need to configure IIS to proxy /api/* requests
// OR update this to return the absolute backend URL (e.g., 'http://localhost:5000/api')
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default api;

api.get("/posts")
  .then(res => console.log(res.data))
  .catch(err => console.error(err));

const getApiBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // If there's a specific backend URL set, use it (for IIS scenarios)
    // Otherwise use relative path (works when Node.js serves frontend)
    const backendUrl = import.meta.env.VITE_API_URL;
    if (backendUrl) {
      return backendUrl;
    }
  }
  // Always use relative path to ensure API calls go to the same origin
  // This works when Node.js backend serves the frontend on the same port
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove Content-Type for FormData - browser will set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response from server. Is the backend running?');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${window.location.origin}${imagePath}`;
};

export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  signup: (username, email, password) =>
    apiClient.post('/auth/register', { username, email, password }),
  
  getMe: () =>
    apiClient.get('/auth/me')
};

export const postsAPI = {
  getAll: () =>
    apiClient.get('/posts'),
  
  getById: (id) =>
    apiClient.get(`/posts/${id}`),
  
  create: (formData) => {
    // Don't set Content-Type for FormData - let browser set it with boundary
    return apiClient.post('/posts', formData);
  },
  
  update: (id, formData) => {
    // Don't set Content-Type for FormData - let browser set it with boundary
    return apiClient.put(`/posts/${id}`, formData);
  },
  
  delete: (id) =>
    apiClient.delete(`/posts/${id}`)
};

export const commentsAPI = {
  getByPost: (postId) =>
    apiClient.get(`/comments/post/${postId}`),
  
  create: (postId, content) =>
    apiClient.post('/comments', { postId, content }),
  
  update: (id, content) =>
    apiClient.put(`/comments/${id}`, { content }),
  
  delete: (id) =>
    apiClient.delete(`/comments/${id}`)
};







