import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

let apiInstance = null;

export function useApi() {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true, // Enable sending cookies with requests
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor - no need to manually add token, httpOnly cookie is auto-sent
    apiInstance.interceptors.request.use(
      (config) => {
        // Token is now in httpOnly cookie, automatically sent by browser
        // No need to manually add Authorization header
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized - only redirect if user is already authenticated
        // (meaning token expired), not for login/register failures
        if (error.response?.status === 401) {
          const token = localStorage.getItem('token');
          if (token) {
            // Token exists but is invalid/expired - clear and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          }
          // If no token, let the error propagate (for login/register failures)
        }
        return Promise.reject(error);
      }
    );
  }

  return {
    api: apiInstance
  };
}
