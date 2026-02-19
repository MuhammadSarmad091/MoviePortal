<template>
  <div class="home-page">
    <!-- Error Banner for Movie Submission -->
    <div v-if="error && showAddMovieModal" class="error-banner">
      <div class="error-banner-content">
        <span class="error-icon">❌</span>
        <span class="error-text">{{ error }}</span>
        <button @click="error = null" class="close-btn">×</button>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Discover Movies</h1>
        <p>Your gateway to cinema. Explore, rate, and review your favorite films.</p>
        <div class="hero-buttons">
          <button class="btn-primary btn-lg" @click="scrollToMovies">Browse Movies</button>
          <router-link v-if="!isAuthenticated" to="/auth/register" class="btn-secondary btn-lg">
            Join Now
          </router-link>
        </div>
      </div>
    </section>

    <!-- Movies Section -->
    <section class="movies-section">
      <!-- Section Header -->
      <div class="section-header">
        <h2>{{ searchQuery ? 'Search Results' : 'Popular Movies' }}</h2>
        <button
          v-if="isAuthenticated"
          @click="openAddMovieModal"
          class="add-movie-button"
        >
          ➕ Add Movie
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <search-bar @search="handleSearch" @clear="handleClearSearch" />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <span class="loading-text">Loading movies...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Oops! Something went wrong</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-button" @click="loadMovies">
          Try Again
        </button>
      </div>

      <!-- Movies Grid -->
      <div v-else>
        <movie-grid :movies="movies" />

        <!-- Pagination -->
        <pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="goToPage"
        />
      </div>
    </section>

    <!-- Add Movie Modal -->
    <add-edit-movie-modal
      v-if="showAddMovieModal"
      :is-loading="isSubmittingMovie"
      @close="closeAddMovieModal"
      @submit="handleMovieAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useApi } from '../composables/useApi'
import SearchBar from '../components/search/SearchBar.vue'
import MovieGrid from '../components/movie/MovieGrid.vue'
import Pagination from '../components/pagination/Pagination.vue'
import AddEditMovieModal from '../components/modal/AddEditMovieModal.vue'

const { isAuthenticated } = useAuth()
const { api } = useApi()

const movies = ref([])
const isLoading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const showAddMovieModal = ref(false)
const isSubmittingMovie = ref(false)

const loadMovies = async () => {
  isLoading.value = true
  error.value = null

  try {
    const endpoint = searchQuery.value
      ? `/movies/search?title=${encodeURIComponent(searchQuery.value)}&page=${currentPage.value}`
      : `/movies?page=${currentPage.value}`

    const response = await api.get(endpoint)

    movies.value = response.data.movies || []
    totalPages.value = response.data.totalPages || 1

    // Reset to page 1 if no results
    if (movies.value.length === 0 && currentPage.value > 1) {
      currentPage.value = 1
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load movies. Please try again.'
    console.error('Error loading movies:', err)
    movies.value = []
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async (query) => {
  searchQuery.value = query
  currentPage.value = 1
  await loadMovies()
}

const handleClearSearch = async () => {
  searchQuery.value = ''
  currentPage.value = 1
  await loadMovies()
}

const goToPage = async (page) => {
  currentPage.value = page
  await loadMovies()
  // Scroll to movies section
  document.querySelector('.movies-section')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToMovies = () => {
  document.querySelector('.movies-section')?.scrollIntoView({ behavior: 'smooth' })
}

const openAddMovieModal = () => {
  showAddMovieModal.value = true
}

const closeAddMovieModal = () => {
  showAddMovieModal.value = false
}

const handleMovieAdded = async (movieData) => {
  try {
    isSubmittingMovie.value = true
    console.log('Saving movie with data:', movieData)
    
    // Make API call to create or update movie
    if (movieData.isEditing && movieData.movieId) {
      // Update existing movie
      console.log('Updating movie:', movieData.movieId)
      await api.put(`/movies/${movieData.movieId}`, {
        title: movieData.title,
        description: movieData.description,
        releaseDate: movieData.releaseDate,
        posterUrl: movieData.posterUrl,
        trailerUrl: movieData.trailerUrl
      })
    } else {
      // Create new movie
      console.log('Creating new movie')
      const response = await api.post('/movies', {
        title: movieData.title,
        description: movieData.description,
        releaseDate: movieData.releaseDate,
        posterUrl: movieData.posterUrl,
        trailerUrl: movieData.trailerUrl
      })
      console.log('Movie created successfully:', response.data)
    }
    
    // Close modal and reload
    showAddMovieModal.value = false
    currentPage.value = 1
    await loadMovies()
    console.log('Movies reloaded after adding new movie')
  } catch (err) {
    console.error('Failed to save movie:', err)
    console.error('Error details:', {
      status: err.response?.status,
      message: err.response?.data?.message,
      data: err.response?.data
    })
    error.value = err.response?.data?.message || 'Failed to save movie. Please try again.'
  } finally {
    isSubmittingMovie.value = false
  }
}

// Load movies on mount
onMounted(() => {
  loadMovies()
})
</script>

<style scoped>
@import '../styles/pages/home.css';
</style>
