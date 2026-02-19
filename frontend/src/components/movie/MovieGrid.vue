<template>
  <div class="movie-grid-wrapper">
    <div v-if="movies.length === 0" class="no-movies">
      <span class="empty-icon">🎬</span>
      <p>No movies found. Try adjusting your search or add a new movie.</p>
    </div>

    <div v-else class="movie-grid">
      <movie-card
        v-for="movie in movies"
        :key="movie.id || movie._id"
        :movie="movie"
      />
    </div>
  </div>
</template>

<script setup>
import MovieCard from './MovieCard.vue'

defineProps({
  movies: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
.movie-grid-wrapper {
  width: 100%;
}

.no-movies {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.no-movies p {
  text-align: center;
  max-width: 400px;
  font-size: var(--font-size-lg);
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
  padding: 1rem 0;
}

@media (max-width: 1200px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
