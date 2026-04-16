import { ref } from 'vue';
import { useApi } from './useApi';

export function useMovieReviews() {
  const { api } = useApi();
  const reviews = ref([]);
  const reviewError = ref(null);
  const reviewsPage = ref(1);
  const reviewsPages = ref(1);
  const totalReviews = ref(0);
  let abortController = null;

  const fetchReviews = async (movieId) => {
    if (!movieId) return;

    if (abortController) abortController.abort();
    abortController = new AbortController();

    try {
      const response = await api.get(
        `/movies/${movieId}/reviews?page=${reviewsPage.value}&limit=5`,
        { signal: abortController.signal }
      );
      const data = response.data;
      reviews.value = data.reviews || [];
      totalReviews.value = data.pagination?.totalReviews || 0;
      reviewsPages.value = data.pagination?.totalPages || 1;
    } catch (err) {
      if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return;
      reviewError.value = err.response?.data?.message || err.message || 'Failed to load reviews';
    }
  };

  const cancelPending = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  return {
    reviews,
    reviewError,
    reviewsPage,
    reviewsPages,
    totalReviews,
    fetchReviews,
    cancelPending
  };
}
