import { useApi } from '../composables/useApi';

export const movieService = {
  async getMovies({ page, limit, query }) {
    const { api } = useApi();
    const endpoint = query
      ? `/movies/search?title=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      : `/movies?page=${page}&limit=${limit}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  async getMovieWithRank(movieId) {
    const { api } = useApi();
    const response = await api.get(`/movies/${movieId}/with-rank`);
    return response.data;
  },

  async createMovie(payload) {
    const { api } = useApi();
    const response = await api.post('/movies', payload);
    return response.data;
  },

  async updateMovie(movieId, payload) {
    const { api } = useApi();
    const response = await api.put(`/movies/${movieId}`, payload);
    return response.data;
  },

  async deleteMovie(movieId) {
    const { api } = useApi();
    const response = await api.delete(`/movies/${movieId}`);
    return response.data;
  }
};
