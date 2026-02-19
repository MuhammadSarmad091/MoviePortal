<template>
  <div class="movie-details-page">
    <nav class="navbar">
      <div class="nav-container">
        <button @click="goHome" class="btn-back"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back</button>
        <h1 class="logo"><i class="fa-solid fa-film" aria-hidden="true"></i> MoviesPortal</h1>
        <div class="nav-space"></div>
      </div>
    </nav>

    <div v-if="loading" class="loading">Loading movie details...</div>
    <div v-else-if="movie" class="movie-details">
      <div class="movie-header">
        <div class="poster-section">
          <img :src="movie.posterUrl" :alt="movie.title" class="poster-image">
          <div v-if="isOwner" class="owner-actions">
            <button @click="editMovie" class="btn-edit">Edit</button>
            <button @click="deleteMovie" class="btn-delete">Delete</button>
          </div>
        </div>

          <div class="info-section">
          <h1>{{ movie.title }}</h1>
          <div class="movie-meta">
            <span class="rating"><i class="fa-solid fa-star" aria-hidden="true"></i> {{ movie.averageRating || 'N/A' }}/10</span>
            <span class="reviews-count"><i class="fa-solid fa-comments" aria-hidden="true"></i> {{ movie.reviewsCount || 0 }} Reviews</span>
            <span class="release-date"><i class="fa-solid fa-calendar" aria-hidden="true"></i> {{ formatDate(movie.releaseDate) }}</span>
          </div>

          <p class="description">{{ movie.description }}</p>

          <div class="trailer-section">
            <h3>Trailer</h3>
            <iframe 
              v-if="movie.trailerUrl"
              :src="movie.trailerUrl" 
              title="Trailer"
              width="100%"
              height="400"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="trailer-video"
            ></iframe>
            <p v-else class="no-trailer">No trailer available</p>
          </div>
        </div>
      </div>

      <div class="reviews-section">
        <h2>Reviews ({{ movie.reviewsCount || 0 }})</h2>

        <div v-if="isAuthenticated && !hasUserReview" class="review-form-container">
          <h3>Write a Review</h3>
          <form @submit.prevent="submitReview" class="review-form">
            <div class="form-group">
              <label for="rating">Rating</label>
              <select v-model.number="newReview.rating" id="rating" required>
                <option value="">Select rating</option>
                <option v-for="i in 10" :key="i" :value="i">{{ i }} ⭐</option>
              </select>
            </div>

            <div class="form-group">
              <label for="content">Review</label>
              <textarea 
                v-model="newReview.content" 
                id="content" 
                placeholder="Write your review here..."
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn-submit-review" :disabled="isSubmittingReview">
              {{ isSubmittingReview ? 'Submitting...' : 'Post Review' }}
            </button>
          </form>
        </div>

        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews">
            No reviews yet. Be the first to review!
          </div>
          <review-card 
            v-for="review in reviews" 
            :key="review._id"
            :review="review"
            :can-edit="review.userId === currentUserId"
            @edit="editReview(review)"
            @delete="deleteReview(review._id)"
          />
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      Movie not found
    </div>
  </div>
</template>

<script>
import ReviewCard from '../components/ReviewCard.vue'
import movieAPI from '../services/movieAPI'
import reviewAPI from '../services/reviewAPI'

export default {
  name: 'MovieDetailsPage',
  components: {
    ReviewCard
  },
  data() {
    return {
      movie: null,
      reviews: [],
      loading: false,
      isSubmittingReview: false,
      isAuthenticated: false,
      currentUserId: null,
      newReview: {
        rating: '',
        content: ''
      }
    }
  },
  computed: {
    movieId() {
      return this.$route.params.id;
    },
    isOwner() {
      return this.movie && this.currentUserId === this.movie.userId;
    },
    hasUserReview() {
      return this.reviews.some(r => r.userId === this.currentUserId);
    }
  },
  methods: {
    async fetchMovieDetails() {
      this.loading = true;
      try {
        const response = await movieAPI.getMovieById(this.movieId);
        this.movie = response.movie || response;
      } catch (error) {
        console.error('Error fetching movie:', error);
        this.movie = null;
      } finally {
        this.loading = false;
      }
    },
    async fetchReviews() {
      try {
        const response = await reviewAPI.getMovieReviews(this.movieId);
        this.reviews = response.reviews || [];
      } catch (error) {
        console.error('Error fetching reviews:', error);
        this.reviews = [];
      }
    },
    async submitReview() {
      if (!this.newReview.rating || !this.newReview.content) {
        alert('Please fill in all fields');
        return;
      }

      this.isSubmittingReview = true;
      try {
        await reviewAPI.createReview(this.movieId, this.newReview);
        this.newReview = { rating: '', content: '' };
        await this.fetchReviews();
        await this.fetchMovieDetails();
      } catch (error) {
        console.error('Error submitting review:', error);
        alert(error.message);
      } finally {
        this.isSubmittingReview = false;
      }
    },
    editReview(review) {
      // Modal will be shown in next steps
      console.log('Edit review:', review);
    },
    async deleteReview(reviewId) {
      if (confirm('Are you sure you want to delete this review?')) {
        try {
          await reviewAPI.deleteReview(reviewId);
          await this.fetchReviews();
          await this.fetchMovieDetails();
        } catch (error) {
          console.error('Error deleting review:', error);
          alert(error.message);
        }
      }
    },
    editMovie() {
      // Modal will be shown in next steps
      console.log('Edit movie');
    },
    async deleteMovie() {
      if (confirm('Are you sure you want to delete this movie?')) {
        try {
          await movieAPI.deleteMovie(this.movieId);
          this.$router.push('/');
        } catch (error) {
          console.error('Error deleting movie:', error);
          alert(error.message);
        }
      }
    },
    formatDate(date) {
      if (!date) return 'Unknown';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    goHome() {
      this.$router.push('/');
    }
  },
  mounted() {
    this.isAuthenticated = !!localStorage.getItem('token');
    this.currentUserId = localStorage.getItem('userId');
    this.fetchMovieDetails();
    this.fetchReviews();
  }
}
</script>

<style scoped>
.movie-details-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-back {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-back:hover {
  background: #5568d3;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.nav-space {
  width: 80px;
}

.loading, .not-found {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
  max-width: 1200px;
  margin: 0 auto;
}

.movie-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.movie-header {
  display: flex;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.poster-section {
  flex: 0 0 300px;
  position: relative;
}

.poster-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.owner-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-edit {
  background: #667eea;
  color: white;
}

.btn-edit:hover {
  background: #5568d3;
}

.btn-delete {
  background: #ff6b6b;
  color: white;
}

.btn-delete:hover {
  background: #ff5252;
}

.info-section {
  flex: 1;
}

.info-section h1 {
  font-size: 32px;
  margin-bottom: 15px;
  color: #333;
}

.movie-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.movie-meta span {
  font-size: 14px;
  color: #666;
}

.description {
  line-height: 1.6;
  color: #666;
  margin-bottom: 30px;
}

.trailer-section {
  margin-top: 30px;
}

.trailer-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.trailer-video {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-trailer {
  text-align: center;
  color: #999;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.reviews-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.reviews-section h2 {
  margin-bottom: 30px;
  color: #333;
}

.review-form-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.review-form-container h3 {
  margin-bottom: 20px;
  color: #333;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.btn-submit-review {
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-submit-review:hover:not(:disabled) {
  background: #5568d3;
}

.btn-submit-review:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reviews-list {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.no-reviews {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .movie-header {
    flex-direction: column;
    gap: 20px;
  }

  .poster-section {
    flex: 1;
  }

  .info-section h1 {
    font-size: 24px;
  }

  .movie-meta {
    flex-direction: column;
    gap: 10px;
  }

  .trailer-video {
    height: 250px;
  }
}
</style>
