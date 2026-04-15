import { useApi } from '../composables/useApi';

export const reviewService = {
  async getMovieReviews(movieId, page = 1, limit = 5) {
    const { api } = useApi();
    const response = await api.get(`/movies/${movieId}/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createReview(movieId, payload) {
    const { api } = useApi();
    const response = await api.post(`/movies/${movieId}/reviews`, payload);
    return response.data;
  },

  async updateReview(reviewId, payload) {
    const { api } = useApi();
    const response = await api.put(`/reviews/${reviewId}`, payload);
    return response.data;
  },

  async deleteReview(reviewId) {
    const { api } = useApi();
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};
