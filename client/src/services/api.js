import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('grocify_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── PRODUCTS ──────────────────────────────────────────
export const fetchProducts = (params = {}) =>
  api.get('/products', { params }).then(r => r.data)

export const fetchProduct = (id) =>
  api.get(`/products/${id}`).then(r => r.data)

export const createReview = (id, data) =>
  api.post(`/products/${id}/reviews`, data).then(r => r.data)

// ── CATEGORIES ────────────────────────────────────────
export const fetchCategories = () =>
  api.get('/categories').then(r => r.data)

// ── AUTH ──────────────────────────────────────────────
export const registerUser = (data) =>
  api.post('/users/register', data).then(r => r.data)

export const loginUser = (data) =>
  api.post('/users/login', data).then(r => r.data)

export const getProfile = () =>
  api.get('/users/profile').then(r => r.data)

export const updateProfile = (data) =>
  api.put('/users/profile', data).then(r => r.data)

export const addAddress = (data) =>
  api.post('/users/address', data).then(r => r.data)

// ── ORDERS ────────────────────────────────────────────
export const createOrder = (data) =>
  api.post('/orders', data).then(r => r.data)

export const verifyPayment = (data) =>
  api.post('/orders/verify-payment', data).then(r => r.data)

export const getMyOrders = () =>
  api.get('/orders/my').then(r => r.data)

export const getOrder = (id) =>
  api.get(`/orders/${id}`).then(r => r.data)

export const cancelOrder = (id) =>
  api.put(`/orders/${id}/cancel`).then(r => r.data)

export default api
