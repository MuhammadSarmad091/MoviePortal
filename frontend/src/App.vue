<template>
  <error-boundary ref="errorBoundary">
    <offline-indicator />
    <router-view></router-view>
  </error-boundary>
</template>

<script setup>
import { ref } from 'vue'
import ErrorBoundary from './components/error/ErrorBoundary.vue'
import OfflineIndicator from './components/error/OfflineIndicator.vue'

const errorBoundary = ref(null)

// Expose error boundary for global use
if (typeof window !== 'undefined') {
  window.__errorBoundary = errorBoundary
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>
