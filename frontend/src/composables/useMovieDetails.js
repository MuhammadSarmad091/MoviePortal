import { ref } from 'vue';
import { movieService } from '../services/movieService';

export function useMovieDetails() {
  const movie = ref(null);
  const movieRank = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const posterLoaded = ref(true);

  const fetchMovieDetails = async (movieId) => {
    if (!movieId) return;
    loading.value = true;
    error.value = null;
    try {
      const data = await movieService.getMovieWithRank(movieId);
      movie.value = data.movie || data;
      movieRank.value = data.rank || null;
      posterLoaded.value = true;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'An error occurred while loading the movie';
    } finally {
      loading.value = false;
    }
  };

  return {
    movie,
    movieRank,
    loading,
    error,
    posterLoaded,
    fetchMovieDetails
  };
}
