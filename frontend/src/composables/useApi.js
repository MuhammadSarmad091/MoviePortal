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

    // Response interceptor
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized - only redirect if user is already authenticated
        // (meaning token expired), not for login/register failures
        if (error.response?.status === 401) {
          const user = localStorage.getItem('user');
          if (user) {
            // Session exists but cookie is invalid/expired
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          }
          // If no user session, let the error propagate (login/register errors)
        }
        return Promise.reject(error);
      }
    );
  }

  return {
    api: apiInstance
  };
}
