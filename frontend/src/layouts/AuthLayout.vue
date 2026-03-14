<template>
  <div class="auth-layout">
    <div class="auth-container">
      <aside class="auth-visual">
        <div class="visual-overlay" />
        <div class="visual-content">
          <div class="visual-card">
            <div class="visual-card-body">
              <h1 class="visual-title">
                <i
                  class="fa-solid fa-film"
                  aria-hidden="true"
                /> MoviesPortal
              </h1>
              <p class="visual-sub">
                Discover, rate and review films — join our community.
              </p>
            </div>
            <div class="visual-card-actions">
              <router-link
                to="/"
                class="visual-cta"
              >
                Explore movies
              </router-link>
            </div>
          </div>
        </div>
      </aside>

      <div class="auth-card">
        <div class="auth-header">
          <h1 class="logo">
            <i
              class="fa-solid fa-user"
              aria-hidden="true"
            /> Welcome
          </h1>
          <p class="tagline">
            Sign in or create an account to get started
          </p>
        </div>

        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 2rem;
  align-items: stretch;
}

.auth-visual {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-image: url('https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1400&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  /*padding: 2rem;*/
}

.visual-overlay {
  position: absolute;
  inset: 0;
  /* strong, even overlay to ensure consistent legibility across the image */
  background: rgba(3, 6, 15, 0.78);
  z-index: 0;
}

.visual-content {
  position: relative;
  z-index: 1;
  text-align: left;
  width: 100%;
  color: #fff; /* ensure text is white over the overlay */
}

.visual-title {
  font-size: 2.25rem;
  margin: 0 0 0.5rem 0;
  color: var(--accent-gold);
}

.visual-sub {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.visual-cta {
  display: inline-block;
  background: transparent;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* New visual-card styling: full-width card inside image with dark background like signin card */
.visual-card {
  width: 100%;
  background-color: var(--bg-primary);
  /*border: 1px solid var(--border-color);*/
  /*border-radius: var(--radius-lg);*/
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.visual-card-body {
  flex: 1 1 auto;
}

.visual-card-actions {
  flex: 0 0 auto;
}

.visual-cta {
  background-color: var(--accent-gold);
  color: #000;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
}

.visual-cta:hover {
  background-color: #e6a620;
  transform: translateY(-2px);
}

.auth-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  text-align: left;
  margin-bottom: 1.25rem;
}

.logo {
  font-size: 1.6rem;
  margin: 0;
  color: var(--accent-gold);
}

.tagline {
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
  font-size: var(--font-size-sm);
}

@media (max-width: 900px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 720px;
  }

  .auth-visual {
    display: none;
  }

  .auth-card {
    max-width: 520px;
    margin: 0 auto;
  }
}
</style>
