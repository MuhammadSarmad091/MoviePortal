<template>
  <div class="movie-details-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading movie details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-icon"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></span>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn-secondary">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
        Go Back
      </button>
    </div>

    <div v-else-if="movie" class="movie-details">
      <!-- Back Button and Actions -->
      <div class="details-header">
          <button class="btn-back" @click="goBack"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back</button>
        <div class="header-actions">
          <share-button :movie="movieWithDefaults" style="--share-button-color: #fff" />
          <button
            v-if="isMovieOwner"
            class="btn-secondary"
            @click="openEditModal"
            title="Edit this movie"
          >
            <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
            Edit
          </button>
          <button
            v-if="isMovieOwner"
            class="btn-delete"
            @click="deleteMovie"
            title="Delete this movie"
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
            Delete
          </button>
        </div>
      </div>

      <!-- Movie Header Section -->
      <div class="movie-header">
        <div class="poster-container">
          <img
            :src="movieWithDefaults.posterUrl"
            :alt="movieWithDefaults.title"
            class="poster-image"
            @error="handleImageError"
            v-if="movieWithDefaults.posterUrl"
          />
          <div v-else class="card-image-placeholder">
            <i class="placeholder-icon fa-solid fa-film" aria-hidden="true"></i>
          </div>
          <div v-if="!posterLoaded" class="poster-placeholder">
            <i class="fa-solid fa-film" aria-hidden="true"></i>
          </div>
        </div>

        <div class="movie-info">
          <h1 class="movie-title">{{ movieWithDefaults.title }}</h1>

            <div class="movie-meta">
            <span class="release-year">{{ movieWithDefaults.releaseYear }}</span>
            <span class="duration"><i class="fa-solid fa-clock" aria-hidden="true"></i> {{ movieWithDefaults.duration }} min</span>
            <span class="rating">
              <span class="stars"><i class="fa-solid fa-star" aria-hidden="true"></i> {{ Number(movieWithDefaults.rating).toFixed(1) }}/10</span>
            </span>
            <span v-if="movieRank" class="rank-badge">
              <i class="fa-solid fa-trophy" aria-hidden="true"></i> Rank #{{ movieRank }}
            </span>
          </div>

          <!-- Genres -->
          <div class="genres-container">
            <span v-for="genre in movieWithDefaults.genres" :key="genre" class="genre-tag">
              {{ genre }}
            </span>
          </div>

          <!-- Synopsis -->
          <div class="synopsis-section">
            <h3>Synopsis</h3>
            <p class="synopsis">{{ movieWithDefaults.synopsis }}</p>
          </div>

          <!-- Cast & Crew -->
          <div class="cast-crew">
            <div v-if="addedBy" class="crew-item">
              <strong>Added By:</strong> {{ addedBy }}
            </div>
            <div v-if="movieWithDefaults.cast && movieWithDefaults.cast.length" class="crew-item">
              <strong>Cast:</strong> {{ Array.isArray(movieWithDefaults.cast) ? movieWithDefaults.cast.join(', ') : movieWithDefaults.cast }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn-primary" @click="handleWatchNow">
              <i class="fa-solid fa-play" aria-hidden="true"></i>
              Watch Now
            </button>
          </div>
        </div>
      </div>

      <!-- Trailer Section -->
      <div v-if="movieWithDefaults.trailerUrl" class="trailer-section">
        <h2>Trailer</h2>
        <div class="trailer-container">
          <iframe
            :src="getYoutubeEmbedUrl(movieWithDefaults.trailerUrl)"
            class="trailer-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <!-- Reviews Section -->
      <review-list
        :movie-id="movieId"
        :reviews="reviews"
        :total-reviews="totalReviews"
        :total-pages="reviewsPages"
        :current-page="reviewsPage"
        :review-error="reviewError"
        @add-review="handleAddReview"
        @edit-review="handleEditReview"
        @delete-review="handleDeleteReview"
        @page-change="handleReviewsPageChange"
        @clear-review-error="clearReviewError"
      />
    </div>

    <!-- Edit Movie Modal -->
    <add-edit-movie-modal
      v-if="showEditModal"
      :initial-movie="movie"
      :movie-id="movieId"
      @close="closeEditModal"
      @submit="handleMovieUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useApi } from '../composables/useApi'
import { API_BASE_URL } from '../config'
import ReviewList from '../components/review/ReviewList.vue'
import ShareButton from '../components/buttons/ShareButton.vue'
import AddEditMovieModal from '../components/modal/AddEditMovieModal.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, getCurrentUser } = useAuth()
const { api } = useApi()

// State variables
const movie = ref(null)
const reviews = ref([])
const loading = ref(true)
const error = ref(null)
const reviewError = ref(null)
const posterLoaded = ref(true)
const reviewsPage = ref(1)
const reviewsPages = ref(1)
const totalReviews = ref(0)
const movieRank = ref(null)
const showEditModal = ref(false)

// Get the movie ID from the route
const movieId = computed(() => {
  const id = route.params.id
  console.log('Route params:', route.params)
  console.log('Movie ID from route:', id)
  return id
})

// Computed properties with fallbacks for movie data
const movieWithDefaults = computed(() => {
  if (!movie.value) return null
  return {
    ...movie.value,
    releaseYear: movie.value.releaseYear || new Date(movie.value.releaseDate).getFullYear() || 'N/A',
    duration: movie.value.duration || '120',
    rating: movie.value.ratings || 0,
    genres: movie.value.genres || [],
    synopsis: movie.value.synopsis || movie.value.description || 'No synopsis available',
    director: movie.value.director || 'Unknown',
    cast: movie.value.cast || [],
    trailerUrl: movie.value.trailerUrl || null,
    posterUrl: movie.value.posterUrl || movie.value.poster || null
  }
})

// Check if current user is the owner of the movie
const isMovieOwner = computed(() => {
  if (!movie.value || !isAuthenticated.value) return false
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  // Compare user IDs - the movie.userId might be an object with _id or a string
  const movieUserId = typeof movie.value.userId === 'string' 
    ? movie.value.userId 
    : movie.value.userId?._id || movie.value.userId?.id
  
  return currentUser.id === movieUserId || currentUser._id === movieUserId
})

// Username of the user who added the movie (handles populated user object or plain id)
const addedBy = computed(() => {
  if (!movie.value || !movie.value.userId) return null
  const u = movie.value.userId
  if (typeof u === 'string') return u
  return u.username || u.name || u.id || u._id || null
})

// Function definitions - MUST BE BEFORE WATCH
const fetchMovieDetails = async () => {
  try {
    if (!movieId.value) {
      console.warn('No movie ID available')
      return
    }
    
    loading.value = true
    error.value = null

    const url = `${API_BASE_URL}/movies/${movieId.value}/with-rank`
    console.log('Fetching movie details from:', url)
    
    const response = await fetch(url)
    console.log('Movie details response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to load movie details: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Movie API response:', data)
    
    // The backend returns { movie, reviewCount, rank }
    movie.value = data.movie || data
    movieRank.value = data.rank || null
    console.log('Movie loaded successfully:', movie.value)
    console.log('Movie rank:', movieRank.value)
    posterLoaded.value = true

    if (isAuthenticated.value) {
      await checkFavoriteStatus()
    }
  } catch (err) {
    console.error('Error fetching movie details:', err)
    error.value = err.message || 'An error occurred while loading the movie'
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  try {
    if (!movieId.value) {
      console.warn('No movie ID available')
      return
    }
    
    const page = reviewsPage.value
    const url = `${API_BASE_URL}/movies/${movieId.value}/reviews?page=${page}&limit=5`
    console.log('Fetching reviews from:', url)
    
    const response = await fetch(url)
    console.log('Reviews response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`Failed to load reviews: ${response.status}`)
    }

    const data = await response.json()
    console.log('Reviews API response:', data)
    
    // Backend returns { reviews, pagination }
    reviews.value = data.reviews || []
    totalReviews.value = data.pagination?.totalReviews || 0
    reviewsPages.value = data.pagination?.totalPages || 1
    console.log('Reviews loaded:', reviews.value.length, 'Total pages:', reviewsPages.value)
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
  console.log('Poster image failed to load')
  posterLoaded.value = false
  if (movie.value) {
    movie.value.posterUrl = null
  }
}

const handleWatchNow = () => {
  alert('Watch functionality coming soon!')
}

const getYoutubeEmbedUrl = (url) => {
  if (!url) return ''
  
  // Handle youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  // Handle youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  // If already an embed URL, return as-is
  if (url.includes('youtube.com/embed')) {
    return url
  }
  
  // Otherwise assume it's a direct video ID
  return `https://www.youtube.com/embed/${url}`
}

const handleAddReview = async (reviewData) => {
  try {
    const token = localStorage.getItem('token')
    const method = reviewData.reviewId ? 'PUT' : 'POST'
    const url = reviewData.reviewId
      ? `${API_BASE_URL}/reviews/${reviewData.reviewId}`
      : `${API_BASE_URL}/movies/${movieId.value}/reviews`

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
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to save review')
    }

    reviewError.value = null
    // Fetch both reviews and updated movie details to refresh rating
    await Promise.all([fetchReviews(), fetchMovieDetails()])
  } catch (err) {
    console.error('Failed to add/edit review:', err)
    reviewError.value = err.message
  }
}

const handleEditReview = (review) => {
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

    // Fetch both reviews and updated movie details to refresh rating
    await Promise.all([fetchReviews(), fetchMovieDetails()])
  } catch (err) {
    console.error('Failed to delete review:', err)
  }
}

const handleReviewsPageChange = (page) => {
  reviewsPage.value = page
  fetchReviews()
}

const clearReviewError = () => {
  reviewError.value = null
}

const goBack = () => {
  router.back()
}

// Load movie details when component mounts or movieId changes
onMounted(async () => {
  // Ensure page starts at top when opened
  if (typeof window !== 'undefined' && window.scrollTo) {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const id = movieId.value
  if (id && id !== 'undefined') {
    console.log('Component mounted, loading movie:', id)
    await fetchMovieDetails()
    await fetchReviews()
  }
})

watch(movieId, async (newId) => {
  if (typeof window !== 'undefined' && window.scrollTo) {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  if (newId && newId !== 'undefined') {
    console.log('MovieId changed to:', newId)
    reviewsPage.value = 1
    await fetchMovieDetails()
    await fetchReviews()
  }
})

// Movie edit/delete handlers
const openEditModal = () => {
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const handleMovieUpdate = async (movieData) => {
  try {
    await api.put(`/movies/${movieId.value}`, {
      title: movieData.title,
      description: movieData.description,
      releaseDate: movieData.releaseDate,
      posterUrl: movieData.posterUrl,
      trailerUrl: movieData.trailerUrl
    })
    
    showEditModal.value = false
    // Reload the movie details
    await fetchMovieDetails()
  } catch (err) {
    console.error('Error updating movie:', err)
    error.value = err.response?.data?.message || 'Failed to update movie'
  }
}

const deleteMovie = async () => {
  if (!confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
    return
  }
  
  try {
    await api.delete(`/movies/${movieId.value}`)
    // Redirect to home page after successful deletion
    router.push('/')
  } catch (err) {
    console.error('Error deleting movie:', err)
    error.value = err.response?.data?.message || 'Failed to delete movie'
  }
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

.header-actions .share-button {
  color: #fff;
}

.header-actions .share-button:hover {
  color: #fff;
  transform: scale(1.05);
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

.card-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-hover) 100%);
  width: 100%;
  height: 100%;
}

.placeholder-icon {
  opacity: 0.5;
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
  align-items: center;
  font-size: var(--font-size-base);
}

.movie-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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

.btn-delete {
  background-color: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  color: #ff6666;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.btn-delete:hover {
  background-color: #ff4444;
  color: white;
  border-color: #ff2222;
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

/* Trailer Section Styles */
.trailer-section {
  margin: 3rem 0;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.trailer-section h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
}

.trailer-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-primary);
}

.trailer-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.rank-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--accent-gold), #ff8c00);
  color: var(--bg-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}
</style>
