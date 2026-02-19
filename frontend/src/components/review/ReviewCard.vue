<template>
  <div class="review-card">
    <div class="review-header">
      <div class="review-user-info">
        <div class="user-avatar">
          {{ userInitials }}
        </div>
        <div class="user-details">
          <h4 class="user-name">{{ review.userId.username }}</h4>
          <span class="review-date">{{ formattedDate }}</span>
        </div>
      </div>

      <div v-if="isAuthor" class="review-actions">
        <button class="action-button edit-button" @click="editReview" title="Edit review">
          <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
        </button>
        <button class="action-button delete-button" @click="deleteReview" title="Delete review">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <div class="review-rating">
      <div class="stars">
        <span v-for="i in 10" :key="i" class="star" :class="{ filled: i <= review.rating }">
          <i class="fa-solid fa-star" aria-hidden="true"></i>
        </span>
      </div>
      <span class="rating-text">{{ review.rating }}/10</span>
    </div>

    <p class="review-content">{{ review.content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  review: {
    type: Object,
    required: true,
    validator: (obj) => obj.id && obj.rating !== undefined
  },
  isAuthor: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete'])

const formattedDate = computed(() => {
  const date = new Date(props.review.createdAt)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const userInitials = computed(() => {
  const username = props.review.userId.username || 'U'
  return username.substring(0, 2).toUpperCase()
})

const editReview = () => {
  emit('edit', props.review)
}

const deleteReview = () => {
  emit('delete', props.review.id)
}
</script>

<style scoped>
.review-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  transition: all var(--transition-base);
}

.review-card:hover {
  box-shadow: var(--shadow-md);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.review-user-info {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, var(--accent-gold), #ffeb3b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: var(--font-weight-bold);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.review-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.review-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0.9;
  padding: 0.25rem;
  color: #fff;
}

.action-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.edit-button:hover {
  color: var(--accent-gold);
}

.delete-button:hover {
  color: var(--danger);
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 1rem;
  color: var(--text-tertiary);
}

.star.filled {
  color: var(--accent-gold);
}

.rating-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-semibold);
}

.review-content {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .review-card {
    padding: 1rem;
  }

  .review-header {
    flex-direction: column;
    gap: 1rem;
  }

  .review-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
