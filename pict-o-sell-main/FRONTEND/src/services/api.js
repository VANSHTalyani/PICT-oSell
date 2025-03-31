import axios from 'axios';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Only clear auth if not on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// Auth endpoints
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const googleLogin = (response) => {
  // Handle different formats of the token
  const payload = typeof response === 'string' 
    ? { token: response } 
    : response.credential 
      ? { token: response.credential } 
      : response;
  
  // For tokens from OAuth callback, we don't need to make a POST request
  // as the token is already validated by the backend
  if (typeof response === 'string') {
    // Return a resolved promise with the expected format
    return Promise.resolve({ token: response });
  }
  
  return api.post('/auth/google', payload);
};
export const getProfile = () => api.get('/auth/profile');

// Product endpoints
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'image' && data[key] instanceof File) {
      formData.append(key, data[key]);
    } else {
      formData.append(key, data[key]);
    }
  });
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const updateProduct = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'image' && data[key] instanceof File) {
      formData.append(key, data[key]);
    } else {
      formData.append(key, data[key]);
    }
  });
  return api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Cart endpoints
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity = 1) => 
  api.post('/cart', { productId, quantity });
export const updateCartQuantity = (productId, quantity) => 
  api.put(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);
export const clearCart = () => api.delete('/cart');

// Wishlist endpoints
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => 
  api.post('/wishlist', { productId });
export const removeFromWishlist = (productId) => 
  api.delete(`/wishlist/${productId}`);

export default api;
