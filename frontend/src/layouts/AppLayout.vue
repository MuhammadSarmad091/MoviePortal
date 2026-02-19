<template>
  <div class="app-layout">
    <!-- Header/Navbar -->
    <header class="app-header">
      <div class="header-container">
        <router-link to="/" class="logo">
          <i class="fa-solid fa-film" aria-hidden="true"></i>
          MoviesPortal
        </router-link>

        <nav class="nav-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          <a href="#" class="nav-link">Explore</a>
        </nav>

        <div class="header-actions">
          <button v-if="!isAuthenticated" @click="goToLogin" class="btn-secondary">
            Login
          </button>

          <div v-else class="user-menu" ref="menuRef">
            <button class="user-button" @click="toggleMenu">
              <span class="user-avatar">{{ userInitials }}</span>
              <span class="user-name">{{ userName }}</span>
              <i class="fa-solid fa-caret-down user-caret" aria-hidden="true"></i>
            </button>

            <div v-if="showMenu" class="user-dropdown">
              <button class="dropdown-item" @click="handleLogout">
                <i class="fa-solid fa-right-from-bracket"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>&copy; 2026 MoviesPortal. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const { isAuthenticated, logout: authLogout, user, getCurrentUser } = useAuth()
const router = useRouter()

const showMenu = ref(false)
const menuRef = ref(null)

const userName = computed(() => {
  const u = user.value || getCurrentUser()
  return u?.username || u?.name || 'User'
})

const userInitials = computed(() => {
  const name = userName.value
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
})

const toggleMenu = (e) => {
  showMenu.value = !showMenu.value
}

const handleLogout = () => {
  authLogout()
  showMenu.value = false
  router.push('/auth/login')
}

const goToLogin = () => {
  router.push('/auth/login')
}

// Close dropdown when clicking outside
const onWindowClick = (e) => {
  if (!menuRef.value) return
  if (!menuRef.value.contains(e.target)) {
    showMenu.value = false
  }
}

onMounted(() => window.addEventListener('click', onWindowClick))
onBeforeUnmount(() => window.removeEventListener('click', onWindowClick))
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
  margin-bottom:0;
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

.user-menu {
  position: relative;
}

.user-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-primary);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold), #ffeb3b);
  color: #000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
}

.user-name {
  font-weight: 600;
}

.user-caret { font-size: 0.8rem; }

.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  z-index: 120;
  min-width: 160px;
  overflow: hidden;
}


.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  color: #fff; /* make logout text white */
}

.dropdown-item i { color: #fff; } /* make logout icon white */

.dropdown-item:hover { background: var(--bg-hover); }

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
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
