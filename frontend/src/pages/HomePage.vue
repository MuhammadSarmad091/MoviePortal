<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Discover Movies</h1>
        <p>Your gateway to cinema. Explore, rate, and review your favorite films.</p>
        <div class="hero-buttons">
          <button
            class="btn-primary btn-lg"
            @click="scrollToMovies"
          >
            Browse Movies
          </button>
          <router-link
            v-if="!isAuthenticated"
            to="/auth/register"
            class="btn-secondary btn-lg"
          >
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
          <i
            class="fa-solid fa-plus"
            aria-hidden="true"
          />
          Add Movie
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <search-bar
          @search="handleSearch"
          @clear="handleClearSearch"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="loading-container"
      >
        <div class="spinner" />
        <span class="loading-text">Loading movies...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="error-container"
      >
        <div class="error-icon">
          <i
            class="fa-solid fa-triangle-exclamation"
            aria-hidden="true"
          />
        </div>
        <h3 class="error-title">
          Oops! Something went wrong
        </h3>
        <p class="error-message">
          {{ error }}
        </p>
        <button
          class="retry-button"
          @click="loadMovies"
        >
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
      @close="closeAddMovieModal"
      @submit="handleMovieAdded"
      :server-error="addMovieServerError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { movieService } from '../services/movieService';
import SearchBar from '../components/search/SearchBar.vue';
import MovieGrid from '../components/movie/MovieGrid.vue';
import Pagination from '../components/pagination/Pagination.vue';
import AddEditMovieModal from '../components/modal/AddEditMovieModal.vue';

const { isAuthenticated } = useAuth();

const movies = ref([]);
const isLoading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref('');
const showAddMovieModal = ref(false);
const itemsPerPage = ref(10);
const addMovieServerError = ref(null);

const loadMovies = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const limit = itemsPerPage.value || 10;
    const data = await movieService.getMovies({
      page: currentPage.value,
      limit,
      query: searchQuery.value
    });

    movies.value = data.movies || [];
    totalPages.value = data.pagination?.totalPages || 1;

    // Reset to page 1 if no results
    if (movies.value.length === 0 && currentPage.value > 1) {
      currentPage.value = 1;
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load movies. Please try again.';
    movies.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Determine items per page so the first page shows two full rows
const computeItemsPerPage = () => {
  // Prefer counting actual rendered CSS grid columns so two full rows fit exactly.
  const gridEl = document.querySelector('.movie-grid');
  if (gridEl) {
    const style = window.getComputedStyle(gridEl);
    const colsStr = style.getPropertyValue('grid-template-columns');
    if (colsStr && colsStr !== 'none') {
      const cols = colsStr.trim().split(/\s+/).length || 1;
      itemsPerPage.value = Math.max(1, cols) * 2;
      return;
    }
  }

  // Fallback: estimate based on container width and conservative min column widths
  const containerWidth = (gridEl && gridEl.clientWidth) || window.innerWidth;
  let minCol = 200;
  if (window.innerWidth <= 480) {
    itemsPerPage.value = 2 * 2;
    return;
  } else if (window.innerWidth <= 768) {
    minCol = 150;
  } else if (window.innerWidth <= 1200) {
    minCol = 180;
  } else {
    minCol = 200;
  }

  const cols = Math.max(1, Math.floor(containerWidth / minCol));
  itemsPerPage.value = cols * 2;
};

let resizeTimer = null;
const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const old = itemsPerPage.value;
    computeItemsPerPage();
    if (itemsPerPage.value !== old) {
      if (currentPage.value !== 1) {
        currentPage.value = 1;
      } else {
        loadMovies();
      }
    }
  }, 150);
};

onMounted(() => {
  computeItemsPerPage();
  window.addEventListener('resize', onResize);
  loadMovies();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  clearTimeout(resizeTimer);
});

// react to page changes
watch(currentPage, async (newPage) => {
  await loadMovies();
});

const handleSearch = async (query) => {
  searchQuery.value = query;
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  await loadMovies();
};

const handleClearSearch = async () => {
  searchQuery.value = '';
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  await loadMovies();
};

const goToPage = async (page) => {
  currentPage.value = page;
  // Scroll to movies section
  document.querySelector('.movies-section')?.scrollIntoView({ behavior: 'smooth' });
};

const scrollToMovies = () => {
  document.querySelector('.movies-section')?.scrollIntoView({ behavior: 'smooth' });
};

const openAddMovieModal = () => {
  addMovieServerError.value = null;
  showAddMovieModal.value = true;
};

const closeAddMovieModal = () => {
  showAddMovieModal.value = false;
  addMovieServerError.value = null;
};

const handleMovieAdded = async (movieData) => {
  try {
    if (movieData.isEditing && movieData.movieId) {
      // Update existing movie
      await movieService.updateMovie(movieData.movieId, {
        title: movieData.title,
        description: movieData.description,
        releaseDate: movieData.releaseDate,
        posterUrl: movieData.posterUrl,
        trailerUrl: movieData.trailerUrl
      });
    } else {
      // Create new movie
      await movieService.createMovie({
        title: movieData.title,
        description: movieData.description,
        releaseDate: movieData.releaseDate,
        posterUrl: movieData.posterUrl,
        trailerUrl: movieData.trailerUrl
      });
    }

    showAddMovieModal.value = false;
    addMovieServerError.value = null;
    // Reload movies after adding a new one
    if (currentPage.value !== 1) {
      currentPage.value = 1;
    } else {
      await loadMovies();
    }
  } catch (err) {
    // Display server message inside modal if present
    const msg = err.response?.data?.message || err.message || 'Failed to save movie';
    addMovieServerError.value = msg;
    // keep modal open so user can fix
    showAddMovieModal.value = true;
  }
};
</script>

<style scoped>
@import '../styles/pages/home.css';
</style>
