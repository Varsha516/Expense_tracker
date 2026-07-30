import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }),
  logout: () => api.post('/auth/logout')
}

export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStats: () => api.get('/transactions/stats/overview')
}

export const budgetService = {
  set: (amount) => api.post('/budget', { amount }),
  get: () => api.get('/budget'),
  getUsage: () => api.get('/budget/usage')
}

export const insightsService = {
  get: () => api.get('/insights'),
  getSpendingTrends: () => api.get('/insights/trends'),
  getHealthScore: () => api.get('/insights/health-score')
}

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
