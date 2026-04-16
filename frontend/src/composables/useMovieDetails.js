import { ref } from 'vue';
import { useApi } from './useApi';

export function useMovieDetails() {
  const { api } = useApi();
  const movie = ref(null);
  const movieRank = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const posterLoaded = ref(true);
  let abortController = null;

  const fetchMovieDetails = async (movieId) => {
    if (!movieId) return;

    // Cancel any in-flight request so stale data from a previous movieId
    // never overwrites the result for the current one.
    if (abortController) abortController.abort();
    abortController = new AbortController();

    loading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/movies/${movieId}/with-rank`, {
        signal: abortController.signal
      });
      const data = response.data;
      movie.value = data.movie || data;
      movieRank.value = data.rank || null;
      posterLoaded.value = true;
    } catch (err) {
      if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return;
      error.value = err.response?.data?.message || err.message || 'An error occurred while loading the movie';
    } finally {
      loading.value = false;
    }
  };

  const cancelPending = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  return {
    movie,
    movieRank,
    loading,
    error,
    posterLoaded,
    fetchMovieDetails,
    cancelPending
  };
}
