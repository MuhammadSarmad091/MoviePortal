<template>
  <div class="app-layout">
    <!-- Header/Navbar -->
    <header class="app-header">
      <div class="header-container">
        <router-link to="/" class="logo">
          🎬 MovieDB
        </router-link>

        <nav class="nav-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          <a href="#" class="nav-link">Explore</a>
        </nav>

        <div class="header-actions">
          <button v-if="!isAuthenticated" @click="goToLogin" class="btn-secondary">
            Login
          </button>
          <button v-else @click="logout" class="btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>&copy; 2026 MovieDB. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { isAuthenticated, logout: authLogout } = useAuth()
const router = useRouter()

const logout = () => {
  authLogout()
  router.push('/auth/login')
}

const goToLogin = () => {
  router.push('/auth/login')
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.app-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-gold);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.logo:hover {
  opacity: 0.8;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
  font-weight: 500;
}

.nav-link:hover {
  color: var(--accent-gold);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.app-footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: auto;
}

@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    padding: 1rem;
    gap: 1rem;
  }

  .nav-menu {
    order: 3;
    flex-basis: 100%;
    gap: 1rem;
  }

  .app-main {
    padding: 1rem;
  }
}
</style>
