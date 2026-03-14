import { ref } from 'vue';
import { useApi } from './useApi';

export function useMovie() {
  const { api } = useApi();
  const movie = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchMovie = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/movies/${id}/with-rank`);
      movie.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching movie:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    movie,
    loading,
    error,
    fetchMovie
  };
}
