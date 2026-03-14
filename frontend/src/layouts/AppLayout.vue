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
          <a href="#" class="nav-link" @click.prevent="goToExplore">Explore</a>
        </nav>

        <div class="header-actions">
          <button v-if="!isAuthenticated" @click="goToLogin" class="btn-secondary btn-login">
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
      <div class="footer-inner">
        <div class="footer-col footer-about">
          <router-link to="/" class="footer-logo">
            <i class="fa-solid fa-film" aria-hidden="true"></i>
            MoviesPortal
          </router-link>
          <p class="footer-text">Discover, review and share your favorite movies. Curated recommendations and community reviews to help you find your next watch.</p>
        </div>

        <div class="footer-col footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><a href="#" class="nav-link" @click.prevent="goToExplore">Explore</a></li>
            <li><router-link to="/auth/login">Login</router-link></li>
            <li><router-link to="/auth/register">Sign Up</router-link></li>
          </ul>
        </div>

        <div class="footer-col footer-social">
          <h4>Follow Us</h4>
          <p class="follow-text">Stay connected — follow MoviesPortal on social media</p>
          <div class="social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" class="social-link"><i class="fa-brands fa-twitter"></i></a>
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" class="social-link"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram" class="social-link"><i class="fa-brands fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn" class="social-link"><i class="fa-brands fa-linkedin-in"></i></a>
            <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube" class="social-link"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span>&copy; 2026 MoviesPortal. All rights reserved.</span>
        <span class="footer-policy">
          <router-link to="/terms">Terms</router-link>
          <router-link to="/privacy">Privacy</router-link>
        </span>
      </div>
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
  // Access .value since user is a ref from Pinia store
  const u = user.value
  return u?.username || u?.name || 'User'
})

const userInitials = computed(() => {
  const name = userName.value
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
})

const toggleMenu = (e) => {
  showMenu.value = !showMenu.value
}

const goToExplore = async () => {
  try {
    const current = router.currentRoute.value && router.currentRoute.value.path
    if (current === '/') {
      document.querySelector('.movies-section')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    await router.push('/')
    // small delay to allow home to render its section
    setTimeout(() => {
      document.querySelector('.movies-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  } catch (e) {
    console.error('Failed to navigate to Explore:', e)
  }
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
  padding: 2.5rem 1rem;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: auto;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto 1.25rem auto;
  display: grid;
  grid-template-columns: 1fr 220px 220px;
  gap: 1.5rem;
  align-items: start;
}

.footer-col h4 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: var(--font-size-sm);
}

.footer-about .footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-gold);
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.footer-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0 0 0.75rem 0;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--accent-gold);
}

.follow-text {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.social-icons {
  display: flex;
  gap: 0.6rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
  text-decoration: none;
  transition: transform 0.15s ease, background 0.15s ease;
}

.social-link i { font-size: 1rem; }

.social-link:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, var(--accent-gold), #ff8c00);
  color: #000;
}

/* Navbar login button (gold, rounded, hover) */
.btn-login {
  background: linear-gradient(135deg, var(--accent-gold), #ffb300);
  color: #111;
  border: 1px solid rgba(0,0,0,0.08);
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 6px 14px rgba(255, 184, 3, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  cursor: pointer;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(255, 184, 3, 0.16);
  opacity: 0.98;
}

.btn-login:active {
  transform: translateY(0);
  box-shadow: 0 6px 12px rgba(0,0,0,0.06);
}

.btn-login:focus {
  outline: 3px solid rgba(255, 193, 7, 0.18);
  outline-offset: 2px;
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.footer-policy a {
  color: var(--text-secondary);
  margin-left: 1rem;
  text-decoration: none;
}

.footer-policy a:hover { color: var(--accent-gold); 
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

  .footer-inner {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
