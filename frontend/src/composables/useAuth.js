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
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      // Store token and user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      user.value = data.user

      return { success: true, data }
    } catch (err) {
      console.error('Login error:', err)
      return { success: false, error: err.message }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      
      // Store token and user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      user.value = data.user

      return { success: true, data }
    } catch (err) {
      console.error('Register error:', err)
      return { success: false, error: err.message }
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
    getCurrentUser
  }
}
