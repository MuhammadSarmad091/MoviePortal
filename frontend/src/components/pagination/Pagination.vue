<template>
  <div class="pagination-container">
    <button
      class="btn btn-pagination"
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      ← Previous
    </button>

    <div class="pagination-info">
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
    </div>

    <button
      class="btn btn-pagination"
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
    >
      Next →
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['change-page'])

const canGoPrevious = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.totalPages)

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('change-page', page)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  min-width: 150px;
  text-align: center;
}

.btn-pagination {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.btn-pagination:hover:not(:disabled) {
  background-color: var(--accent-gold);
  color: var(--bg-primary);
  border-color: var(--accent-gold);
  transform: translateY(-2px);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
