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

const normalizeErrorText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Error) return `${value.message || ''} ${value.stack || ''}`.trim();
  return JSON.stringify(value);
};

const shouldIgnoreExternalClientError = (errorLike) => {
  const text = normalizeErrorText(errorLike).toLowerCase();
  if (!text) return false;

  // Browser extensions/scripts can throw these while app works normally.
  return (
    text.includes('node cannot be found on this page') ||
    text.includes('could not establish connection') ||
    text.includes('receiving end does not exist') ||
    text.includes('chrome-extension://') ||
    text.includes('moz-extension://')
  );
};

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  if (shouldIgnoreExternalClientError(err)) {
    return;
  }
  console.error('Vue Error:', err, info);

  // Try to show error in error boundary
  if (window.__errorBoundary?.value?.setError) {
    window.__errorBoundary.value.setError(err);
  }
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (shouldIgnoreExternalClientError(event.reason)) {
    return;
  }
  console.error('Unhandled Promise Rejection:', event.reason);

  // Try to show error in error boundary
  if (window.__errorBoundary?.value?.setError) {
    window.__errorBoundary.value.setError(new Error(event.reason?.message || String(event.reason)));
  }
});

app.mount('#app');
