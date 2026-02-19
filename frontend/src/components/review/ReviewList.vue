<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h2>Reviews ({{ totalReviews }})</h2>
      <button
        v-if="isAuthenticated && !showForm"
        class="add-review-button btn-primary"
        @click="toggleForm"
      >
        ➕ Write Review
      </button>
    </div>

    <!-- Add Review Form -->
    <review-form
      v-if="isAuthenticated && showForm"
      :initial-review="editingReview"
      :is-loading="isSubmitting"
      @submit="handleSubmitReview"
      @cancel="handleCancelForm"
    />

    <!-- Reviews List -->
    <div v-if="reviews.length > 0" class="reviews-list">
      <review-card
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        :is-author="isReviewAuthor(review)"
        @edit="handleEditReview"
        @delete="handleDeleteReview"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <span class="empty-icon">💭</span>
      <p>No reviews yet. Be the first to review!</p>
    </div>

    <!-- Pagination for Reviews -->
    <pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="goToPage"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import ReviewCard from './ReviewCard.vue'
import ReviewForm from './ReviewForm.vue'
import Pagination from '../pagination/Pagination.vue'

const props = defineProps({
  movieId: {
    type: String,
    required: true
  },
  reviews: {
    type: Array,
    default: () => [],
    validator: (arr) => Array.isArray(arr)
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 1
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['add-review', 'edit-review', 'delete-review', 'page-change'])

const { currentUser, isAuthenticated } = useAuth()

const showForm = ref(false)
const editingReview = ref(null)
const isSubmitting = ref(false)

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    editingReview.value = null
  }
}

const isReviewAuthor = (review) => {
  return currentUser.value && review.userId.id === currentUser.value.id
}

const handleSubmitReview = async (reviewData) => {
  isSubmitting.value = true
  try {
    await emit('add-review', {
      ...reviewData,
      movieId: props.movieId,
      reviewId: editingReview.value?.id
    })
    showForm.value = false
    editingReview.value = null
  } finally {
    isSubmitting.value = false
  }
}

const handleCancelForm = () => {
  showForm.value = false
  editingReview.value = null
}

const handleEditReview = (review) => {
  editingReview.value = review
  showForm.value = true
}

const handleDeleteReview = (reviewId) => {
  if (confirm('Are you sure you want to delete this review?')) {
    emit('delete-review', reviewId)
  }
}

const goToPage = (page) => {
  emit('page-change', page)
}
</script>

<style scoped>
.reviews-section {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-top: 2rem;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.reviews-header h2 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0;
}

.add-review-button {
  padding: 0.75rem 1.5rem;
  flex-shrink: 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: var(--font-size-base);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .reviews-section {
    padding: 1.5rem;
  }

  .reviews-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-review-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
