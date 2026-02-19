import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

let apiInstance = null

export function useApi() {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor
    apiInstance.interceptors.request.use(
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

    // Response interceptor
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          // Optional: Redirect to login (can be handled by router guard)
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  return {
    api: apiInstance
  }
}
