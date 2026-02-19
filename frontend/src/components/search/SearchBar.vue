<template>
  <div class="search-bar">
    <div class="search-input-group">
      <input
        v-model="searchInput"
        type="text"
        placeholder="Search movies by title..."
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button
        v-if="searchInput"
        class="clear-button"
        @click="handleClear"
        title="Clear search"
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <button class="search-button" @click="handleSearch">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        Search
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search', 'clear'])
const searchInput = ref('')

const handleSearch = () => {
  if (searchInput.value.trim()) {
    emit('search', searchInput.value.trim())
  }
}

const handleClear = () => {
  searchInput.value = ''
  emit('clear')
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 2rem;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 2px rgba(255, 184, 82, 0.1);
}

.clear-button,
.search-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.clear-button {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.clear-button:hover {
  background-color: rgba(255, 184, 82, 0.1);
  color: var(--accent-gold);
}

.search-button {
  background-color: var(--accent-gold);
  color: var(--bg-primary);
}

.search-button:hover {
  background-color: #ffa500;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 184, 82, 0.3);
}

@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }

  .search-input,
  .clear-button,
  .search-button {
    width: 100%;
  }
}
</style>
