import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useApi } from '../composables/useApi';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Initialize user from localStorage on store creation
  const initializeAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        user.value = JSON.parse(userData);
      }
    } catch (err) {
      // Clear corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      user.value = null;
    }
  };

  // Initialize immediately
  initializeAuth();

  // Computed
  const isAuthenticated = computed(() => {
    // Check if user has data - don't rely on localStorage in computed
    return !!user.value;
  });

  const currentUser = computed(() => user.value);

  // Actions
  const login = async (email, password) => {
    const { api } = useApi();
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post('/users/login', { email, password });

      // Handle different response structures
      // Backend returns: { message, data: { userId, username, token } }
      let userData = response.data;

      // If response has a nested 'data' property, use that
      if (userData.data && userData.data.userId) {
        userData = userData.data;
      }

      const userId = userData.userId;
      const username = userData.username;
      const token = userData.token;

      if (!userId || !username || !token) {
        throw new Error('Invalid response from server');
      }

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Store complete user data with username from backend
      const completeUser = {
        userId: userId,
        username: username,
        email: email
      };

      localStorage.setItem('user', JSON.stringify(completeUser));

      // Update the reactive ref
      user.value = completeUser;

      loading.value = false;
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Login failed';
      loading.value = false;
      throw err;
    }
  };

  const register = async (username, email, password) => {
    const { api } = useApi();
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post('/users/register', { username, email, password });

      // Handle different response structures
      // Backend returns: { message, data: { userId, username, token } }
      let userData = response.data;

      // If response has a nested 'data' property, use that
      if (userData.data && userData.data.userId) {
        userData = userData.data;
      }

      const userId = userData.userId;
      const usernameFromBackend = userData.username;
      const token = userData.token;

      if (!userId || !usernameFromBackend || !token) {
        throw new Error('Invalid response from server');
      }

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Store complete user data with username from backend
      const completeUser = {
        userId: userId,
        username: usernameFromBackend,
        email: email
      };

      localStorage.setItem('user', JSON.stringify(completeUser));

      // Update the reactive ref
      user.value = completeUser;

      loading.value = false;
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Registration failed';
      loading.value = false;
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user.value = null;
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  const setUser = (userData) => {
    user.value = userData;
  };

  return {
    // State
    user,
    loading,
    error,

    // Computed
    isAuthenticated,
    currentUser,

    // Actions
    login,
    register,
    logout,
    clearError,
    setUser,
    initializeAuth
  };
});
