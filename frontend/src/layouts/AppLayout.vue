<template>
  <div class="app-layout">
    <nav class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="navbar-logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">MovieHub</span>
        </router-link>
        
        <div class="navbar-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search movies..."
            class="search-input"
            @keyup.enter="performSearch"
          />
          
          <div v-if="isAuthenticated" class="user-menu">
            <button class="user-button" @click="toggleUserDropdown">
              {{ currentUser?.username }}
              <span class="dropdown-icon">▼</span>
            </button>
            <div v-if="showUserDropdown" class="user-dropdown">
              <router-link to="/my-movies" class="dropdown-item">My Movies</router-link>
              <button @click="logout" class="dropdown-item logout-btn">Logout</button>
            </div>
          </div>
          
          <router-link v-else to="/auth/login" class="btn-primary">
            Sign In
          </router-link>
        </div>
      </div>
    </nav>
    
    <main class="page-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 MovieHub. All rights reserved.</p>
        <p>Built with Vue 3 + Express.js</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'

const { currentUser, isAuthenticated, logout } = useAuth()
const searchQuery = ref('')
const showUserDropdown = ref(false)

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Search:', searchQuery.value)
    // TODO: Implement search functionality
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.navbar {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-gold);
  text-decoration: none;
  transition: opacity 0.3s;
}

.navbar-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  letter-spacing: 0.5px;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--accent-gold);
}

.search-input {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  width: 250px;
  transition: border-color 0.3s, background-color 0.3s;
  font-size: 0.875rem;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-gold);
  background-color: rgba(255, 184, 28, 0.05);
}

.user-menu {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: color 0.3s;
}

.user-button:hover {
  color: var(--accent-gold);
}

.dropdown-icon {
  font-size: 0.65rem;
  transition: transform 0.3s;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 0.5rem;
  min-width: 150px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: var(--bg-hover);
  color: var(--accent-gold);
}

.logout-btn {
  border-top: 1px solid var(--border-color);
}

.btn-primary {
  background-color: var(--accent-gold);
  color: #000;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s, transform 0.2s;
  display: inline-block;
  font-size: 0.875rem;
}

.btn-primary:hover {
  background-color: #e6a620;
  transform: translateY(-1px);
}

.page-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 2rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.footer-content p {
  margin: 0.25rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-menu {
    gap: 1rem;
  }

  .search-input {
    width: 150px;
  }

  .page-content {
    padding: 1rem;
  }
}
</style>
