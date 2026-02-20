import { ref, computed } from 'vue'

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
    console.error('Failed to parse user data:', err)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export function useAuth() {
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
      console.error('Failed to get current user:', err)
      return null
    }
  }

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const respText = await response.text()
      let data
      try { data = JSON.parse(respText) } catch (e) { data = null }

      if (!response.ok) {
        const msg = (data && data.message) || respText || 'Login failed'
        throw new Error(msg)
      }

      // Store token and user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      user.value = data.user

      loading.value = false
      return { success: true, data }
    } catch (err) {
      console.error('Login error:', err)
      error.value = err.message || 'Login failed'
      loading.value = false
      throw err
    }
  }

  const register = async (username, email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })

      const respText = await response.text()
      let data
      try { data = JSON.parse(respText) } catch (e) { data = null }

      if (!response.ok) {
        const msg = (data && data.message) || respText || 'Registration failed'
        throw new Error(msg)
      }

      // Store token and user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      user.value = data.user

      loading.value = false
      return { success: true, data }
    } catch (err) {
      console.error('Register error:', err)
      error.value = err.message || 'Registration failed'
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
