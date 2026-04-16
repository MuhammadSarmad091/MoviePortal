import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import { useAuthStore } from './stores/authStore';
import './styles/variables.css';

const app = createApp(App);

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

  return (
    text.includes('node cannot be found on this page') ||
    text.includes('could not establish connection') ||
    text.includes('receiving end does not exist') ||
    text.includes('chrome-extension://') ||
    text.includes('moz-extension://')
  );
};

app.config.errorHandler = (err, instance, info) => {
  if (shouldIgnoreExternalClientError(err)) {
    return;
  }
  console.error('Vue Error:', err, info);

  if (window.__errorBoundary?.value?.setError) {
    window.__errorBoundary.value.setError(err);
  }
};

window.addEventListener('unhandledrejection', (event) => {
  if (shouldIgnoreExternalClientError(event.reason)) {
    return;
  }
  console.error('Unhandled Promise Rejection:', event.reason);

  if (window.__errorBoundary?.value?.setError) {
    window.__errorBoundary.value.setError(new Error(event.reason?.message || String(event.reason)));
  }
});

// Restore session from the httpOnly cookie before the first render,
// so route guards and components see the correct auth state immediately.
const authStore = useAuthStore();
authStore.checkAuth().finally(() => {
  app.mount('#app');
});
