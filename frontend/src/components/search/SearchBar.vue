<template>
  <div class="search-bar">
    <form @submit.prevent="handleSearch" class="search-form">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button
          v-if="searchQuery.trim()"
          type="button"
          class="clear-button"
          @click="clearSearch"
          title="Clear search"
        >
          ✕
        </button>
      </div>
      <button type="submit" class="search-button btn-primary btn-sm">
        Search
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search', 'clear'])

const searchQuery = ref('')

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    emit('search', query)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('clear')
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0 1rem;
  transition: all var(--transition-fast);
}

.search-input-wrapper:focus-within {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
}

.search-icon {
  font-size: 1rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  padding: 0.75rem 0;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-button {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.clear-button:hover {
  color: var(--accent-gold);
  transform: rotate(90deg);
}

.search-button {
  padding: 0.75rem 2rem;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }

  .search-input-wrapper {
    min-width: auto;
  }

  .search-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .search-form {
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-input-wrapper {
    padding: 0 0.75rem;
  }

  .search-input {
    padding: 0.5rem 0;
    font-size: var(--font-size-sm);
  }
}
</style>
