import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import './styles/variables.css';

const app = createApp(App);

// Initialize Pinia
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err, info);

  // Try to show error in error boundary
  if (window.__errorBoundary?.value?.setError) {
    window.__errorBoundary.value.setError(err);
  }
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);

  // Try to show error in error boundary
  if (window.__errorBoundary?.value?.setError) {
    window.__errorBoundary.value.setError(new Error(event.reason?.message || String(event.reason)));
  }
});

app.mount('#app');
