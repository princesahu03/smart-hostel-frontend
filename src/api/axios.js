import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : '/api/v1',
  withCredentials: true,
  timeout: 10000 // ← 10 sec timeout
})

// Request interceptor:
api.interceptors.request.use(
  (config) => {
    const token = localStorage
      .getItem('token')
    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor:
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sirf 401 pe redirect:
    if (error.response?.status === 401) {
      const currentPath =
        window.location.pathname
      // Login page pe already ho
      // toh redirect mat karo!
      if (currentPath !== '/login' &&
          currentPath !== '/register') {
        localStorage.removeItem('token')
        delete api.defaults.headers
          .common['Authorization']
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api