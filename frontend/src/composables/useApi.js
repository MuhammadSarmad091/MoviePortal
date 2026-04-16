import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

let apiInstance = null;

export function useApi() {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    apiInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Silently swallow cancelled requests — the caller already moved on
        if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
          return Promise.reject(error);
        }

        // Network / timeout — no response from server
        if (!error.response) {
          console.error('[API] Network error:', error.message);
          return Promise.reject(error);
        }

        const { status } = error.response;

        if (status === 401) {
          // Clear in-memory session without hitting the backend again
          // (the cookie is already invalid/expired).
          try {
            const { useAuthStore } = await import('../stores/authStore');
            const store = useAuthStore();
            if (store.user) {
              store.clearSession();
              window.location.href = '/auth/login';
            }
          } catch {
            // Store not yet initialized — fall through so the error propagates
          }
        }

        if (status >= 500) {
          console.error('[API] Server error:', error.response.data?.message || status);
        }

        return Promise.reject(error);
      }
    );
  }

  return {
    api: apiInstance
  };
}
