<template>
  <div class="home-page">
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

    <section class="movies-section">
      <h2>Popular Movies</h2>
      <p class="section-subtitle">Coming soon...</p>
      <div class="movies-grid">
        <div class="movie-card-placeholder">
          <div class="placeholder-image"></div>
          <div class="placeholder-content">
            <div class="placeholder-title"></div>
            <div class="placeholder-text"></div>
          </div>
        </div>
        <div class="movie-card-placeholder">
          <div class="placeholder-image"></div>
          <div class="placeholder-content">
            <div class="placeholder-title"></div>
            <div class="placeholder-text"></div>
          </div>
        </div>
        <div class="movie-card-placeholder">
          <div class="placeholder-image"></div>
          <div class="placeholder-content">
            <div class="placeholder-title"></div>
            <div class="placeholder-text"></div>
          </div>
        </div>
        <div class="movie-card-placeholder">
          <div class="placeholder-image"></div>
          <div class="placeholder-content">
            <div class="placeholder-title"></div>
            <div class="placeholder-text"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'

const { isAuthenticated } = useAuth()

const scrollToMovies = () => {
  document.querySelector('.movies-section')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.home-page {
  width: 100%;
}

.hero {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(255, 193, 7, 0.1) 100%);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  text-align: center;
  border: 1px solid var(--border-color);
}

.hero-content h1 {
  font-size: 3rem;
  background: linear-gradient(135deg, var(--accent-gold), #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-weight: var(--font-weight-semibold);
}

.btn-secondary {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  background-color: var(--border-color);
  border-color: var(--accent-gold);
}

.movies-section {
  margin-top: 3rem;
}

.movies-section h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: var(--text-tertiary);
  font-size: var(--font-size-base);
  margin-bottom: 2rem;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.movie-card-placeholder {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  animation: pulse 2s infinite;
}

.placeholder-image {
  width: 100%;
  height: 280px;
  background-color: var(--bg-hover);
}

.placeholder-content {
  padding: 1rem;
}

.placeholder-title {
  height: 1rem;
  background-color: var(--bg-hover);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.placeholder-text {
  height: 0.75rem;
  background-color: var(--bg-hover);
  border-radius: 4px;
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
  .hero {
    padding: 2rem 1rem;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: var(--font-size-base);
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .placeholder-image {
    height: 200px;
  }
}
</style>
