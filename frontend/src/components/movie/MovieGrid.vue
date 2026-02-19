<template>
  <div class="movies-grid">
    <transition-group name="fade" tag="div" class="grid-wrapper">
      <movie-card
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        :rank="getRank(movie.id)"
      />
    </transition-group>

    <div v-if="movies.length === 0" class="empty-state">
      <div class="empty-icon">🎬</div>
      <h3>No Movies Found</h3>
      <p>Try adjusting your search or filters</p>
    </div>
  </div>
</template>

<script setup>
import MovieCard from './MovieCard.vue'

defineProps({
  movies: {
    type: Array,
    default: () => [],
    validator: (arr) => Array.isArray(arr)
  },
  movieRanks: {
    type: Object,
    default: () => ({}),
    validator: (obj) => typeof obj === 'object'
  }
})

const getRank = (movieId) => {
  // Returns rank if available, else null
  const ranks = Object.entries(
    Object.groupBy || {}
  )
  return null
}
</script>

<style scoped>
.movies-grid {
  width: 100%;
}

.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: var(--font-size-sm);
  margin-bottom: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .grid-wrapper {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
