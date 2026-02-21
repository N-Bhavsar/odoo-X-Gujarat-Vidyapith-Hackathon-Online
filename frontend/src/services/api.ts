import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Log the actual error from the server
      console.error('API Error:', error.response.status, error.response.data)
      
      // Format error message
      if (error.response.data?.errors) {
        // Validation errors
        const messages = error.response.data.errors.map((err: any) => err.msg || err.message).join(', ')
        error.message = messages
      } else if (error.response.data?.message) {
        error.message = error.response.data.message
      }
    }
    return Promise.reject(error)
  }
)

export default api
