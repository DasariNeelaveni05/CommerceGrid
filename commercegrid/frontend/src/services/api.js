import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cg_token');
      localStorage.removeItem('cg_user');
    }
    return Promise.reject(error);
  }
);

// ── Products ──────────────────────────────────────────────────
export const getProducts = (params) => API.get('/products', { params });
export const searchProducts = (q, limit = 6) => API.get('/products/search', { params: { q, limit } });
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (formData) => API.post('/products', formData);
export const updateProduct = (id, formData) => API.put(`/products/${id}`, formData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getProductStats = () => API.get('/products/stats');
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);

// ── Categories ────────────────────────────────────────────────
export const getCategories = () => API.get('/categories');
export const getCategoryById = (id) => API.get(`/categories/${id}`);
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// ── Auth ──────────────────────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.patch('/auth/me', data);

// ── Cart ──────────────────────────────────────────────────────
export const getCart = () => API.get('/cart');
export const addToCart = (productId, quantity = 1) => API.post('/cart', { productId, quantity });
export const updateCartItem = (id, quantity) => API.put(`/cart/${id}`, { quantity });
export const removeFromCart = (id) => API.delete(`/cart/${id}`);
export const clearCart = () => API.delete('/cart');

// ── Orders ────────────────────────────────────────────────────
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const getAdminOrders = () => API.get('/orders/admin');
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);

export default API;
