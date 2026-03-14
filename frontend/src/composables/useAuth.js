import { ref, computed } from 'vue'
import { useApi } from './useApi'

const user = ref(null)

// Check if token exists in localStorage
const token = localStorage.getItem('token')
if (token) {
  // In a real app, you would validate the token here
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      user.value = JSON.parse(userData)
    }
  } catch (err) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export function useAuth() {
  const { api } = useApi()
  const currentUser = computed(() => user.value)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => {
    return !!localStorage.getItem('token') && !!user.value
  })

  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch (err) {
      return null
    }
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/users/login', { email, password })

      // Store token and user
      const userData = response.data.data || response.data
      localStorage.setItem('token', userData.token)
      localStorage.setItem('user', JSON.stringify({ userId: userData.userId }))
      user.value = { userId: userData.userId }

      loading.value = false
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Login failed'
      loading.value = false
      throw err
    }
  }

  const register = async (username, email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/users/register', { username, email, password })

      // Store token and user
      const userData = response.data.data || response.data
      localStorage.setItem('token', userData.token)
      localStorage.setItem('user', JSON.stringify({ userId: userData.userId }))
      user.value = { userId: userData.userId }

      loading.value = false
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Registration failed'
      loading.value = false
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = null
  }

  return {
    user: currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    currentUser,
    getCurrentUser,
    loading,
    error
  }
}
