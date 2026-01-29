import axios from 'axios'

// Production backend URL
const PRODUCTION_API_URL = 'https://ims-3l5iv.ondigitalocean.app'

// Use environment variable if available, otherwise use production URL
const baseURL = import.meta.env.VITE_API_URL || PRODUCTION_API_URL

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('API Error: No response received', error.request)
    } else {
      console.error('API Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
