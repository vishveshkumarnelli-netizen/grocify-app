import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('grocify_admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('grocify_admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── AUTH ──────────────────────────────────────────────────────
export const adminLogin   = d => api.post('/users/login', d).then(r => r.data)
export const updateProfile = d => api.put('/users/profile', d).then(r => r.data)

// ── DASHBOARD STATS ───────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats').then(r => r.data)

// ── PRODUCTS ──────────────────────────────────────────────────
export const getProducts    = p  => api.get('/products', { params: p }).then(r => r.data)
export const getProduct     = id => api.get(`/products/${id}`).then(r => r.data)
export const createProduct  = d  => api.post('/products', d).then(r => r.data)
export const updateProduct  = (id, d) => api.put(`/products/${id}`, d).then(r => r.data)
export const deleteProduct  = id => api.delete(`/products/${id}`).then(r => r.data)
export const bulkProducts   = d  => api.patch('/admin/products/bulk', d).then(r => r.data)
export const addReview      = (id, d) => api.post(`/products/${id}/reviews`, d).then(r => r.data)

// ── CATEGORIES ────────────────────────────────────────────────
export const getCategories  = ()      => api.get('/categories').then(r => r.data)
export const createCategory = d       => api.post('/categories', d).then(r => r.data)
export const updateCategory = (id, d) => api.put(`/categories/${id}`, d).then(r => r.data)
export const deleteCategory = id      => api.delete(`/categories/${id}`).then(r => r.data)

// ── ORDERS ────────────────────────────────────────────────────
export const getAllOrders   = p  => api.get('/orders', { params: p }).then(r => r.data)
export const getOrderById   = id => api.get(`/orders/${id}`).then(r => r.data)
export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status }).then(r => r.data)

// ── USERS ─────────────────────────────────────────────────────
export const getAllUsers = () => api.get('/users').then(r => r.data)

export default api
