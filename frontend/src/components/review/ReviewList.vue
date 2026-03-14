<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h2>Reviews ({{ totalReviews }})</h2>
      <button
        v-if="isAuthenticated && !showForm"
        class="add-review-button btn-primary"
        @click="toggleForm"
      >
        <i
          class="fa-solid fa-plus"
          aria-hidden="true"
        />
        Write Review
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

    <!-- Error Message -->
    <div
      v-if="props.reviewError || formError"
      class="error-alert"
    >
      <span class="error-icon"><i
        class="fa-solid fa-triangle-exclamation"
        aria-hidden="true"
      /></span>
      <span>{{ props.reviewError || formError }}</span>
      <button
        class="close-error"
        @click="handleClearError"
      >
        <i
          class="fa-solid fa-xmark"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Reviews List -->
    <div
      v-if="reviews.length > 0"
      class="reviews-list"
    >
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
    <div
      v-else
      class="empty-state"
    >
      <i
        class="empty-icon fa-solid fa-comment-dots"
        aria-hidden="true"
      />
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
import { ref, computed } from 'vue';
import { useAuth } from '../../composables/useAuth';
import ReviewCard from './ReviewCard.vue';
import ReviewForm from './ReviewForm.vue';
import Pagination from '../pagination/Pagination.vue';

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
  },
  reviewError: {
    type: String,
    default: null
  }
});

const emit = defineEmits([
  'add-review',
  'edit-review',
  'delete-review',
  'page-change',
  'clear-review-error'
]);

const { currentUser, isAuthenticated } = useAuth();

const showForm = ref(false);
const editingReview = ref(null);
const isSubmitting = ref(false);
const formError = ref(null);

const toggleForm = () => {
  showForm.value = !showForm.value;
  formError.value = null;
  if (!showForm.value) {
    editingReview.value = null;
  }
};

const isReviewAuthor = (review) => {
  if (!currentUser.value || !review.userId) return false;

  // Handle userId as string (populated ID)
  if (typeof review.userId === 'string') {
    return currentUser.value.id === review.userId || currentUser.value._id === review.userId;
  }

  // Handle userId as object with id or _id fields
  const reviewUserId = review.userId.id || review.userId._id;
  return currentUser.value.id === reviewUserId || currentUser.value._id === reviewUserId;
};

const handleSubmitReview = async (reviewData) => {
  isSubmitting.value = true;
  try {
    await emit('add-review', {
      ...reviewData,
      movieId: props.movieId,
      reviewId: editingReview.value?.id
    });
    showForm.value = false;
    editingReview.value = null;
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancelForm = () => {
  showForm.value = false;
  editingReview.value = null;
};

const handleEditReview = (review) => {
  editingReview.value = review;
  showForm.value = true;
};

const handleDeleteReview = (reviewId) => {
  if (confirm('Are you sure you want to delete this review?')) {
    emit('delete-review', reviewId);
  }
};

const handleClearError = () => {
  formError.value = null;
  emit('clear-review-error');
};

const goToPage = (page) => {
  emit('page-change', page);
};
</script>

<style scoped>
.error-alert {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #c33;
}

.error-icon {
  flex-shrink: 0;
  font-size: 1.2rem;
}

.close-error {
  margin-left: auto;
  background: none;
  border: none;
  color: #c33;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  line-height: 1;
}

.close-error:hover {
  opacity: 0.7;
}

.reviews-section {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-top: 1.5rem;
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
  font-size: 1.8rem;
  display: block;
  margin-bottom: 0.5rem;
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
