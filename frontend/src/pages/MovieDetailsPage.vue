<template>
  <div class="movie-details-page">
    <div class="breadcrumb">
      <router-link to="/">Home</router-link>
      <span> / </span>
      <span>Movie Details</span>
    </div>

    <div class="movie-details-container">
      <div class="movie-header">
        <div class="movie-poster">
          <div class="poster-placeholder"></div>
        </div>
        <div class="movie-info">
          <h1>Movie Title</h1>
          <div class="movie-meta">
            <span class="release-year">2024</span>
            <span class="rating">★ Coming Soon</span>
          </div>
          <p class="movie-description">
            Movie description will appear here...
          </p>
          <div class="movie-actions">
            <button class="btn-primary">Add to Watchlist</button>
            <button class="btn-secondary">Share</button>
          </div>
        </div>
      </div>

      <section class="reviews-section">
        <h2>Reviews</h2>
        <p class="section-note">Movie reviews will be displayed here...</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.movie-details-page {
  width: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: 2rem;
}

.breadcrumb a {
  color: var(--accent-gold);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.breadcrumb a:hover {
  opacity: 0.8;
}

.movie-details-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.movie-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.movie-poster {
  width: 100%;
}

.poster-placeholder {
  width: 100%;
  aspect-ratio: 2 / 3;
  background: linear-gradient(135deg, var(--bg-hover), var(--border-color));
  border-radius: var(--radius-md);
  animation: pulse 2s infinite;
}

.movie-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
}

.movie-info h1 {
  font-size: 2.5rem;
  margin: 0;
  color: var(--text-primary);
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.release-year {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
}

.rating {
  font-size: var(--font-size-lg);
  color: var(--accent-gold);
  font-weight: var(--font-weight-semibold);
}

.movie-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0.5rem 0 1rem 0;
}

.movie-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--accent-gold);
  color: #000;
}

.btn-primary:hover {
  background-color: #e6a620;
}

.btn-secondary {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--accent-gold);
  background-color: var(--border-color);
}

.reviews-section {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.reviews-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.section-note {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .movie-header {
    grid-template-columns: 1fr;
  }

  .movie-info h1 {
    font-size: 1.75rem;
  }

  .movie-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
