<template>
  <div class="movie-details-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading movie details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn-secondary">
        ← Go Back
      </button>
    </div>

    <div v-else-if="movie" class="movie-details">
      <!-- Back Button and Actions -->
      <div class="details-header">
        <button class="btn-back" @click="goBack">← Back</button>
        <div class="header-actions">
          <favorite-button
            :movie-id="movieId"
            :is-favorite="isFavorite"
            @toggle="toggleFavorite"
          />
          <share-button :movie="movie" />
        </div>
      </div>

      <!-- Movie Header Section -->
      <div class="movie-header">
        <div class="poster-container">
          <img
            :src="movie.posterUrl"
            :alt="movie.title"
            class="poster-image"
            @error="handleImageError"
          />
          <div v-if="!posterLoaded" class="poster-placeholder">
            🎬
          </div>
        </div>

        <div class="movie-info">
          <h1 class="movie-title">{{ movie.title }}</h1>

          <div class="movie-meta">
            <span class="release-year">{{ movie.releaseYear }}</span>
            <span class="duration">⏱️ {{ movie.duration }} min</span>
            <span class="rating">
              <span class="stars">★ {{ movie.rating.toFixed(1) }}/10</span>
            </span>
          </div>

          <!-- Genres -->
          <div class="genres-container">
            <span v-for="genre in movie.genres" :key="genre" class="genre-tag">
              {{ genre }}
            </span>
          </div>

          <!-- Synopsis -->
          <div class="synopsis-section">
            <h3>Synopsis</h3>
            <p class="synopsis">{{ movie.synopsis }}</p>
          </div>

          <!-- Cast & Crew -->
          <div class="cast-crew">
            <div v-if="movie.director" class="crew-item">
              <strong>Director:</strong> {{ movie.director }}
            </div>
            <div v-if="movie.cast && movie.cast.length" class="crew-item">
              <strong>Cast:</strong> {{ movie.cast.join(', ') }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn-primary" @click="handleWatchNow">
              ▶️ Watch Now
            </button>
            <button class="btn-secondary" @click="openTrailer" v-if="movie.trailerUrl">
              🎞️ Watch Trailer
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <review-list
        :movie-id="movieId"
        :reviews="reviews"
        :total-reviews="totalReviews"
        :total-pages="reviewsPages"
        :current-page="reviewsPage"
        @add-review="handleAddReview"
        @edit-review="handleEditReview"
        @delete-review="handleDeleteReview"
        @page-change="handleReviewsPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { API_BASE_URL } from '../../config'
import ReviewList from '../review/ReviewList.vue'
import FavoriteButton from '../buttons/FavoriteButton.vue'
import ShareButton from '../buttons/ShareButton.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

const movieId = computed(() => route.params.id)

const movie = ref(null)
const reviews = ref([])
const loading = ref(true)
const error = ref(null)
const posterLoaded = ref(false)
const isFavorite = ref(false)

const reviewsPage = ref(1)
const reviewsPages = ref(1)
const totalReviews = ref(0)

onMounted(async () => {
  await fetchMovieDetails()
  await fetchReviews()
})

const fetchMovieDetails = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch(`${API_BASE_URL}/movies/${movieId.value}`)
    if (!response.ok) {
      throw new Error('Failed to load movie details')
    }

    movie.value = await response.json()
    posterLoaded.value = true

    if (isAuthenticated.value) {
      await checkFavoriteStatus()
    }
  } catch (err) {
    error.value = err.message || 'An error occurred while loading the movie'
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  try {
    const page = reviewsPage.value
    const response = await fetch(
      `${API_BASE_URL}/movies/${movieId.value}/reviews?page=${page}&limit=5`
    )

    if (!response.ok) {
      throw new Error('Failed to load reviews')
    }

    const data = await response.json()
    reviews.value = data.reviews
    totalReviews.value = data.total
    reviewsPages.value = data.pages
  } catch (err) {
    console.error('Failed to fetch reviews:', err)
  }
}

const checkFavoriteStatus = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(
      `${API_BASE_URL}/favorites/check/${movieId.value}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      isFavorite.value = data.isFavorite
    }
  } catch (err) {
    console.error('Failed to check favorite status:', err)
  }
}

const toggleFavorite = async () => {
  try {
    const token = localStorage.getItem('token')
    const method = isFavorite.value ? 'DELETE' : 'POST'

    const response = await fetch(`${API_BASE_URL}/favorites/${movieId.value}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      isFavorite.value = !isFavorite.value
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
  }
}

const handleImageError = () => {
  if (movie.value) {
    movie.value.posterUrl = null
  }
}

const handleWatchNow = () => {
  // Implementation for watch functionality
  alert('Watch functionality coming soon!')
}

const openTrailer = () => {
  if (movie.value.trailerUrl) {
    window.open(movie.value.trailerUrl, '_blank')
  }
}

const handleAddReview = async (reviewData) => {
  try {
    const token = localStorage.getItem('token')
    const method = reviewData.reviewId ? 'PUT' : 'POST'
    const url = reviewData.reviewId
      ? `${API_BASE_URL}/reviews/${reviewData.reviewId}`
      : `${API_BASE_URL}/reviews`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        movieId: reviewData.movieId,
        rating: reviewData.rating,
        content: reviewData.content
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save review')
    }

    await fetchReviews()
  } catch (err) {
    console.error('Failed to add/edit review:', err)
  }
}

const handleEditReview = (review) => {
  // Handled by ReviewList component
  console.log('Edit review:', review)
}

const handleDeleteReview = async (reviewId) => {
  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete review')
    }

    await fetchReviews()
  } catch (err) {
    console.error('Failed to delete review:', err)
  }
}

const handleReviewsPageChange = (page) => {
  reviewsPage.value = page
  fetchReviews()
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.movie-details-container {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
  gap: 1rem;
}

.spinner {
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-gold);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
}

.error-state p {
  text-align: center;
  max-width: 400px;
}

.movie-details {
  max-width: 1200px;
  margin: 0 auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.btn-back {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.btn-back:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-gold);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.movie-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.poster-container {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-hover) 100%);
}

.movie-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.movie-title {
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  margin: 0;
}

.movie-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: var(--font-size-base);
}

.release-year {
  color: var(--text-secondary);
}

.duration {
  color: var(--text-secondary);
}

.rating {
  display: inline-flex;
  align-items: center;
}

.stars {
  color: var(--accent-gold);
  font-weight: var(--font-weight-semibold);
}

.genres-container {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.genre-tag {
  background-color: var(--accent-gold);
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.synopsis-section h3 {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.synopsis {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: var(--font-size-base);
  margin: 0;
}

.cast-crew {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.crew-item {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.crew-item strong {
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-semibold);
  border: none;
}

.btn-primary {
  background-color: var(--accent-gold);
  color: #000;
}

.btn-primary:hover {
  background-color: #e6a620;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-gold);
}

/* Responsive */
@media (max-width: 768px) {
  .movie-header {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .poster-container {
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
  }

  .movie-title {
    font-size: var(--font-size-2xl);
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .details-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }
}
</style>
