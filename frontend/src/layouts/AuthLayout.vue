<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <router-link to="/" class="auth-logo">
            <span class="logo-icon">🎬</span>
            <span class="logo-text">MovieHub</span>
          </router-link>
          <p class="auth-subtitle">Your Gateway to Cinema</p>
        </div>
        
        <router-view />
        
        <div class="auth-footer">
          <p v-if="isLoginPage" class="footer-text">
            Don't have an account?
            <router-link to="/auth/register" class="footer-link">Sign up here</router-link>
          </p>
          <p v-else class="footer-text">
            Already have an account?
            <router-link to="/auth/login" class="footer-link">Sign in here</router-link>
          </p>
        </div>
      </div>
      
      <div class="auth-background">
        <div class="bg-decoration"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isLoginPage = computed(() => {
  return route.name === 'Login'
})
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.auth-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-gold);
  text-decoration: none;
  transition: opacity 0.3s;
}

.auth-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 2.5rem;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.auth-subtitle {
  color: var(--text-tertiary);
  margin: 0.75rem 0 0 0;
  font-size: 0.875rem;
  letter-spacing: 0.1px;
}

.auth-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.footer-text {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  margin: 0;
}

.footer-link {
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.3s;
}

.footer-link:hover {
  opacity: 0.8;
}

.auth-background {
  display: none;
  position: absolute;
  right: -100px;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 300px;
  z-index: 0;
}

.bg-decoration {
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(255, 184, 28, 0.1) 0%,
    transparent 70%
  );
  border-radius: 50%;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-card {
    max-width: 100%;
    padding: 2rem;
  }

  .auth-background {
    display: none;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .logo-icon {
    font-size: 1.75rem;
  }
}
</style>
