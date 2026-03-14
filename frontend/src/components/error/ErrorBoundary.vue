<template>
  <div
    v-if="hasError"
    class="error-boundary"
  >
    <div class="error-container">
      <div class="error-icon">
        <i
          class="fa-solid fa-circle-exclamation"
          aria-hidden="true"
        />
      </div>
      <h2>Something Went Wrong</h2>
      <p class="error-message">
        {{ errorMessage }}
      </p>
      <div
        class="error-details"
        v-if="showDetails && error"
      >
        <pre>{{ error }}</pre>
      </div>
      <div class="error-actions">
        <button
          @click="resetError"
          class="btn-primary"
        >
          Try Again
        </button>
        <button
          @click="goHome"
          class="btn-secondary"
        >
          Go to Home
        </button>
        <button
          @click="toggleDetails"
          class="btn-tertiary"
        >
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const hasError = ref(false);
const error = ref(null);
const errorMessage = ref('An unexpected error occurred.');
const showDetails = ref(false);
const router = useRouter();

// Expose methods for parent to call
const setError = (err) => {
  error.value = err;
  errorMessage.value = err?.message || 'An unexpected error occurred.';
  hasError.value = true;
  showDetails.value = false;
  // Log to console for debugging
  console.error('Error Boundary caught:', err);
};

const resetError = () => {
  hasError.value = false;
  error.value = null;
  errorMessage.value = '';
  showDetails.value = false;
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const goHome = () => {
  resetError();
  router.push('/');
};

defineExpose({
  setError,
  resetError,
  hasError
});
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.error-icon {
  font-size: 60px;
  color: #dc2626;
  margin-bottom: 20px;
}

h2 {
  color: #1f2937;
  margin-bottom: 10px;
  font-size: 24px;
}

.error-message {
  color: #4b5563;
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.error-details {
  background: #f3f4f6;
  border-left: 4px solid #dc2626;
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
  text-align: left;
  overflow-x: auto;
  max-height: 200px;
}

.error-details pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #374151;
}

.error-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-tertiary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.btn-tertiary {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-tertiary:hover {
  background: #f9fafb;
  color: #1f2937;
}
</style>
