<template>
  <div class="pagination">
    <button
      class="pagination-button prev-button"
      :disabled="currentPage <= 1"
      @click="goToPrevious"
      title="Previous page"
    >
      ← Previous
    </button>

    <div class="page-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-number"
        :class="{ active: page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </div>

    <button
      class="pagination-button next-button"
      :disabled="currentPage >= totalPages"
      @click="goToNext"
      title="Next page"
    >
      Next →
    </button>

    <div class="page-info">
      <span class="info-text">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    validator: (val) => val >= 1
  },
  totalPages: {
    type: Number,
    required: true,
    validator: (val) => val >= 1
  }
})

const emit = defineEmits(['page-change'])

const visiblePages = computed(() => {
  const pages = []
  const range = 2 // Show 2 pages on each side of current
  const start = Math.max(1, props.currentPage - range)
  const end = Math.min(props.totalPages, props.currentPage + range)

  if (start > 1) {
    pages.push(1)
    if (start > 2) {
      pages.push('...')
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < props.totalPages) {
    if (end < props.totalPages - 1) {
      pages.push('...')
    }
    pages.push(props.totalPages)
  }

  return pages
})

const goToPage = (page) => {
  if (typeof page === 'number' && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const goToPrevious = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

const goToNext = () => {
  if (props.currentPage < props.totalPages) {
    emit('page-change', props.currentPage + 1)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.pagination-button {
  padding: 0.5rem 1rem;
  background-color: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--accent-gold);
  color: #000;
  border-color: var(--accent-gold);
  transform: translateY(-2px);
}

.pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.page-number {
  min-width: 2.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.page-number:hover:not(.active) {
  background-color: var(--border-color);
  border-color: var(--accent-gold);
}

.page-number.active {
  background-color: var(--accent-gold);
  color: #000;
  border-color: var(--accent-gold);
  font-weight: var(--font-weight-bold);
}

.page-info {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.info-text {
  display: block;
}

/* Responsive */
@media (max-width: 768px) {
  .pagination {
    gap: 0.75rem;
    padding: 1rem;
  }

  .pagination-button {
    padding: 0.4rem 0.75rem;
    font-size: var(--font-size-xs);
  }

  .page-number {
    min-width: 2.25rem;
    padding: 0.4rem 0.5rem;
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .pagination-button {
    width: 100%;
  }

  .page-numbers {
    width: 100%;
  }

  .page-number {
    flex: 1;
    min-width: 0;
  }
}
</style>
