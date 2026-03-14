<template>
  <form
    @submit.prevent="handleSubmit"
    class="review-form"
  >
    <h3>{{ isEditing ? 'Edit Your Review' : 'Add Your Review' }}</h3>

    <!-- Rating -->
    <div class="form-group">
      <label class="form-label">Rating *</label>
      <div class="rating-selector">
        <button
          v-for="i in 10"
          :key="i"
          type="button"
          class="star-button"
          :class="{ selected: (hoverRating || form.rating) >= i }"
          @click.prevent="form.rating = i"
          @mouseenter="hoverRating = i"
          @mouseleave="hoverRating = 0"
          :title="`Rate ${i} stars`"
        >
          <i
            class="fa-solid fa-star"
            aria-hidden="true"
          />
        </button>
      </div>
      <span
        class="rating-display"
        v-if="form.rating"
      >{{ form.rating }}/10</span>
    </div>

    <!-- Review Content -->
    <div class="form-group">
      <label
        for="content"
        class="form-label"
      >Your Review *</label>
      <textarea
        id="content"
        v-model="form.content"
        placeholder="Share your thoughts about this movie..."
        class="form-textarea"
        :class="{ 'input-error': errors.content }"
        required
      />
      <p
        v-if="errors.content"
        class="error-message"
      >
        {{ errors.content }}
      </p>
    </div>

    <!-- General Error -->
    <div
      v-if="error"
      class="error-box"
    >
      {{ error }}
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <button
        type="button"
        class="btn-secondary"
        @click="resetForm"
        :disabled="isLoading"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="btn-primary"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">
          {{ isEditing ? 'Update Review' : 'Post Review' }}
        </span>
        <span v-else>Saving...</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';

const props = defineProps({
  initialReview: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
  rating: props.initialReview?.rating || 0,
  content: props.initialReview?.content || ''
});

const errors = reactive({
  rating: '',
  content: ''
});

const error = ref(null);

const isEditing = ref(!!props.initialReview);

const hoverRating = ref(0);

// Watch for changes to initialReview to update the form
watch(
  () => props.initialReview,
  (newReview) => {
    if (newReview) {
      form.rating = newReview.rating || 0;
      form.content = newReview.content || '';
      isEditing.value = true;
    } else {
      form.rating = 0;
      form.content = '';
      isEditing.value = false;
    }
  },
  { deep: true }
);

const validateForm = () => {
  let isValid = true;

  errors.rating = '';
  errors.content = '';
  error.value = null;

  if (form.rating === 0) {
    errors.rating = 'Please select a rating';
    isValid = false;
  }

  if (!form.content.trim()) {
    errors.content = 'Review content is required';
    isValid = false;
  } else if (form.content.trim().length < 20) {
    errors.content = 'Review must be at least 20 characters';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }

  emit('submit', {
    ...form,
    isEditing: isEditing.value
  });
};

const resetForm = () => {
  form.rating = props.initialReview?.rating || 0;
  form.content = props.initialReview?.content || '';
  emit('cancel');
};
</script>

<style scoped>
h3 {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.review-form {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.5rem;
}

.rating-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.star-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.star-button:hover {
  color: var(--accent-gold);
  transform: scale(1.1);
}

.star-button.selected {
  color: var(--accent-gold);
}

.rating-display {
  font-size: var(--font-size-sm);
  color: var(--accent-gold);
  font-weight: var(--font-weight-semibold);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: var(--font-size-base);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast);
  font-family: var(--font-family);
  resize: vertical;
  min-height: 120px;
}

.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--accent-gold);
  background-color: rgba(255, 193, 7, 0.05);
}

.form-textarea.input-error {
  border-color: var(--danger);
  background-color: rgba(244, 67, 54, 0.05);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--danger);
  margin: 0.5rem 0 0 0;
}

.error-box {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  color: #ff6b6b;
  font-size: var(--font-size-sm);
  text-align: center;
  margin-bottom: 1.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--border-color);
  border-color: var(--accent-gold);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--accent-gold);
  color: #000;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-semibold);
}

.btn-primary:hover:not(:disabled) {
  background-color: #e6a620;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
