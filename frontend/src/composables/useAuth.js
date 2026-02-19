import { ref, computed } from 'vue'
import { useApi } from './useApi'

const currentUser = ref(null)
const token = ref(localStorage.getItem('token'))
const loading = ref(false)
const error = ref(null)

const { api } = useApi()

export function useAuth() {
  const isAuthenticated = computed(() => {
    return !!token.value && !!currentUser.value
  })

  const loadUserFromStorage = async () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      try {
        const response = await api.get('/users/me')
        currentUser.value = response.data
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('token')
        token.value = null
        currentUser.value = null
      }
    }
  }

  const register = async (username, email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/users/register', {
        username,
        email,
        password
      })
      token.value = response.data.token
      currentUser.value = response.data.user
      localStorage.setItem('token', token.value)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/users/login', {
        email,
        password
      })
      token.value = response.data.token
      currentUser.value = response.data.user
      localStorage.setItem('token', token.value)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    currentUser.value = null
    localStorage.removeItem('token')
    error.value = null
  }

  // Load user on module instantiation
  if (token.value && !currentUser.value) {
    loadUserFromStorage()
  }

  return {
    currentUser,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    loadUserFromStorage
  }
}
