import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/authService';

/**
 * Authentication Store — httpOnly-cookie only
 *
 * The JWT lives exclusively in an httpOnly cookie managed by the backend.
 * JavaScript never reads, stores, or transmits the token directly.
 *
 * On page load the store calls GET /users/me (cookie sent automatically via
 * withCredentials) to restore the session into in-memory Pinia state.
 * No data is persisted in localStorage.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!user.value);
  const currentUser = computed(() => user.value);

  /**
   * Restore session from the httpOnly cookie by calling GET /users/me.
   * Should be awaited once at app startup (before mount) so that the
   * initial render already knows whether the user is logged in.
   */
  const checkAuth = async () => {
    try {
      const response = await authService.getMe();
      const data = response.data || response;
      if (data.userId) {
        user.value = {
          userId: data.userId,
          username: data.username,
          email: data.email
        };
      }
    } catch {
      // 401 or network error — user is simply not authenticated
      user.value = null;
    }
  };

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.login(email, password);

      let userData = response;
      if (userData.data && userData.data.userId) {
        userData = userData.data;
      }

      const userId = userData.userId;
      const username = userData.username;
      if (!userId || !username) {
        throw new Error('Invalid response from server');
      }

      user.value = { userId, username, email };

      loading.value = false;
      return { success: true, data: response };
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Login failed';
      loading.value = false;
      throw err;
    }
  };

  const register = async (username, email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.register(username, email, password);

      let userData = response;
      if (userData.data && userData.data.userId) {
        userData = userData.data;
      }

      const userId = userData.userId;
      const usernameFromBackend = userData.username;
      if (!userId || !usernameFromBackend) {
        throw new Error('Invalid response from server');
      }

      user.value = { userId, username: usernameFromBackend, email };

      loading.value = false;
      return { success: true, data: response };
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Registration failed';
      loading.value = false;
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the server call fails, clear local state.
    } finally {
      user.value = null;
      error.value = null;
    }
  };

  /**
   * Clear in-memory session without hitting the backend.
   * Used by the 401 interceptor where the cookie is already invalid.
   */
  const clearSession = () => {
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
    user,
    loading,
    error,

    isAuthenticated,
    currentUser,

    checkAuth,
    login,
    register,
    logout,
    clearSession,
    clearError,
    setUser
  };
});
