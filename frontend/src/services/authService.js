import { useApi } from '../composables/useApi';

export const authService = {
  async login(email, password) {
    const { api } = useApi();
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  async register(username, email, password) {
    const { api } = useApi();
    const response = await api.post('/users/register', { username, email, password });
    return response.data;
  },

  async logout() {
    const { api } = useApi();
    const response = await api.post('/users/logout');
    return response.data;
  },

  async getMe() {
    const { api } = useApi();
    const response = await api.get('/users/me');
    return response.data;
  }
};
