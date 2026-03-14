<template>
  <router-link
    :to="`/movie/${movie.id}`"
    class="movie-card"
  >
    <div class="card-image-wrapper">
      <img
        v-if="movie.posterUrl"
        :src="movie.posterUrl"
        :alt="movie.title"
        class="card-image"
        loading="lazy"
        @error="handleImageError"
        @load="handleImageLoad"
      >
      <div
        v-else
        class="card-image-placeholder"
      >
        <i
          class="placeholder-icon fa-solid fa-film"
          aria-hidden="true"
        />
      </div>

      <div class="card-overlay">
        <div class="card-hover-info">
          <span class="view-details">View Details</span>
        </div>
      </div>

      <!-- Rank Badge - Enhanced -->
      <div
        v-if="rank !== null"
        class="rank-badge"
      >
        <span class="rank-number">#{{ rank }}</span>
        <span
          v-if="rank === 1"
          class="rank-icon"
        ><i
          class="fa-solid fa-crown"
          aria-hidden="true"
        /></span>
      </div>

      <!-- Review Count Badge -->
      <div class="review-badge">
        <span class="review-count">{{ reviewCount }}</span>
        <span class="review-icon"><i
          class="fa-solid fa-comments"
          aria-hidden="true"
        /></span>
      </div>

      <!-- Image Rating Badge (bottom-left) -->
      <div
        class="image-rating"
        v-if="averageRating"
      >
        <i
          class="fa-solid fa-star"
          aria-hidden="true"
        />
        <span class="rating-value">{{ averageRating }}</span>
      </div>
    </div>

    <div class="card-content">
      <h3 class="card-title">
        {{ movie.title }}
      </h3>

      <div class="card-meta">
        <span class="release-date">{{ releaseYear }}</span>
      </div>

      <!-- removed lower rating/activity stats; rating is shown on image -->
    </div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  movie: {
    type: Object,
    required: true,
    validator: (obj) => obj.id && obj.title
  },
  rank: {
    type: Number,
    default: null
  }
});

const imageLoaded = ref(false);
const imageFailed = ref(false);

const releaseYear = computed(() => {
  if (!props.movie.releaseDate) return 'N/A';
  return new Date(props.movie.releaseDate).getFullYear();
});

const averageRating = computed(() => {
  // Backend returns ratings as a single number (average rating)
  return props.movie.ratings ? Number(props.movie.ratings).toFixed(1) : '0';
});

const reviewCount = computed(() => {
  // This comes from the backend review count
  return props.movie.reviewCount || 0;
});

const handleImageLoad = () => {
  imageLoaded.value = true;
};

const handleImageError = () => {
  imageFailed.value = true;
};
</script>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-base);
  text-decoration: none;
  color: inherit;
  position: relative;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
  border-color: var(--accent-gold);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background-color: var(--bg-hover);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.movie-card:hover .card-image {
  transform: scale(1.05);
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-hover), var(--border-color));
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.movie-card:hover .card-overlay {
  opacity: 1;
}

.card-hover-info {
  text-align: center;
}

.view-details {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--accent-gold);
  color: #000;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  transition: background-color var(--transition-fast);
}

.movie-card:hover .view-details {
  background-color: #e6a620;
}

.rank-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: linear-gradient(135deg, var(--accent-gold), #ffeb3b);
  color: #000;
  padding: 0.5rem 0.75rem;
  border-radius: 50%;
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.movie-card:hover .rank-badge {
  transform: scale(1.1) translateY(-4px);
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.6);
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.rank-icon {
  display: inline-block;
  font-size: 0.8rem;
  margin-left: 2px;
}

.review-badge {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--accent-gold);
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 193, 7, 0.3);
  transition: all var(--transition-fast);
}

.movie-card:hover .review-badge {
  background-color: var(--accent-gold);
  color: #000;
  transform: translateY(-4px);
  border-color: var(--accent-gold);
}

/* Rating badge shown over the image at bottom-left */
.image-rating {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background-color: rgba(0, 0, 0, 0.75);
  color: var(--accent-gold);
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 193, 7, 0.18);
  transition: all var(--transition-fast);
}

.movie-card:hover .image-rating {
  transform: translateY(-4px);
  background-color: var(--accent-gold);
  color: #000;
}

.rating-value {
  font-size: 0.95rem;
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.release-date {
  background-color: var(--bg-hover);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.card-stats {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.stat-icon {
  font-size: 0.9rem;
}

.stat-value {
  font-weight: var(--font-weight-semibold);
}

.movie-card:hover .stat {
  color: var(--accent-gold);
}

/* Responsive */
@media (max-width: 480px) {
  .card-title {
    font-size: var(--font-size-sm);
  }

  .rank-badge {
    min-width: 2.25rem;
    height: 2.25rem;
  }
}
</style>
