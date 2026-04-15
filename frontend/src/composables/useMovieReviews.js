import { ref } from 'vue';
import { reviewService } from '../services/reviewService';

export function useMovieReviews() {
  const reviews = ref([]);
  const reviewError = ref(null);
  const reviewsPage = ref(1);
  const reviewsPages = ref(1);
  const totalReviews = ref(0);

  const fetchReviews = async (movieId) => {
    if (!movieId) return;
    const data = await reviewService.getMovieReviews(movieId, reviewsPage.value, 5);
    reviews.value = data.reviews || [];
    totalReviews.value = data.pagination?.totalReviews || 0;
    reviewsPages.value = data.pagination?.totalPages || 1;
  };

  return {
    reviews,
    reviewError,
    reviewsPage,
    reviewsPages,
    totalReviews,
    fetchReviews
  };
}
