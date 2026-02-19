<template>
  <div class="movie-details">
    <div class="movie-header">
      <div class="movie-poster">
        <img
          v-if="movie.posterUrl"
          :src="movie.posterUrl"
          :alt="movie.title"
          class="poster-image"
        />
        <div v-else class="poster-placeholder">🎬</div>
      </div>

      <div class="movie-info">
        <h1 class="movie-title">{{ movie.title }}</h1>

        <div class="movie-meta">
          <span class="meta-item">📅 {{ releaseYear }}</span>
          <span class="meta-divider">•</span>
          <span class="meta-item rating">⭐ {{ averageRating }} / 10</span>
          <span class="meta-divider">•</span>
          <span class="meta-item">💬 {{ reviewCount }} Reviews</span>
        </div>

        <p class="movie-description">{{ movie.description }}</p>

        <div class="movie-actions">
          <button class="btn-primary" @click="playTrailer">
            ▶ Watch Trailer
          </button>
          <button class="btn-secondary" @click="addToWatchlist">
            ➕ Watchlist
          </button>
        </div>
      </div>
    </div>

    <div v-if="isOwner" class="owner-actions">
      <button class="btn-secondary" @click="editMovie">✏️ Edit</button>
      <button class="btn-danger" @click="deleteMovie">🗑️ Delete</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true,
    validator: (obj) => obj.id && obj.title
  },
  isOwner: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['play-trailer', 'edit', 'delete', 'watchlist'])

const releaseYear = computed(() => {
  if (!props.movie.releaseDate) return 'N/A'
  return new Date(props.movie.releaseDate).getFullYear()
})

const averageRating = computed(() => {
  if (!props.movie.ratings || props.movie.ratings.length === 0) {
    return '0.0'
  }
  const avg = props.movie.ratings.reduce((sum, r) => sum + r, 0) / props.movie.ratings.length
  return avg.toFixed(1)
})

const reviewCount = computed(() => {
  return props.movie.ratings ? props.movie.ratings.length : 0
})

const playTrailer = () => {
  emit('play-trailer')
}

const editMovie = () => {
  emit('edit')
}

const deleteMovie = () => {
  emit('delete')
}

const addToWatchlist = () => {
  emit('watchlist')
}
</script>

<style scoped>
.movie-details {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.movie-header {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  padding: 2rem;
}

.movie-poster {
  width: 100%;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.poster-placeholder {
  width: 100%;
  aspect-ratio: 2 / 3;
  background: linear-gradient(135deg, var(--bg-hover), var(--border-color));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.movie-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.movie-title {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-item {
  display: inline-block;
}

.meta-item.rating {
  color: var(--accent-gold);
  font-weight: var(--font-weight-semibold);
}

.meta-divider {
  color: var(--text-tertiary);
}

.movie-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 1rem 0;
}

.movie-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn-primary {
  background-color: var(--accent-gold);
  color: #000;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background-color: #e6a620;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background-color: var(--border-color);
  border-color: var(--accent-gold);
}

.owner-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 2rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-hover);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-danger:hover {
  background-color: #da190b;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .movie-header {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .movie-title {
    font-size: 1.75rem;
  }

  .movie-actions {
    flex-direction: column;
  }

  .movie-actions button {
    width: 100%;
  }

  .owner-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .owner-actions button {
    width: 100%;
  }
}
</style>
