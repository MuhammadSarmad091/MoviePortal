<template>
  <base-modal @close="close">
    <h2>{{ isEditing ? 'Edit Movie' : 'Add New Movie' }}</h2>

    <form @submit.prevent="handleSubmit" class="movie-form">
      <!-- Title -->
      <div class="form-group">
        <label for="title" class="form-label">Movie Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="Enter movie title"
          class="form-input"
          :class="{ 'input-error': errors.title }"
          required
        />
        <p v-if="errors.title" class="error-message">{{ errors.title }}</p>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description" class="form-label">Description *</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter movie description (min. 20 characters)"
          class="form-textarea"
          :class="{ 'input-error': errors.description }"
          required
        ></textarea>
        <p v-if="errors.description" class="error-message">{{ errors.description }}</p>
      </div>

      <!-- Release Date -->
      <div class="form-group">
        <label for="releaseDate" class="form-label">Release Date *</label>
        <input
          id="releaseDate"
          v-model="form.releaseDate"
          type="date"
          class="form-input"
          :class="{ 'input-error': errors.releaseDate }"
          required
        />
        <p v-if="errors.releaseDate" class="error-message">{{ errors.releaseDate }}</p>
      </div>

      <!-- Poster URL -->
      <div class="form-group">
        <label for="posterUrl" class="form-label">Poster URL *</label>
        <input
          id="posterUrl"
          v-model="form.posterUrl"
          type="url"
          placeholder="https://example.com/poster.jpg"
          class="form-input"
          :class="{ 'input-error': errors.posterUrl }"
          required
        />
        <p v-if="errors.posterUrl" class="error-message">{{ errors.posterUrl }}</p>
      </div>

      <!-- Trailer URL -->
      <div class="form-group">
        <label for="trailerUrl" class="form-label">Trailer URL *</label>
        <input
          id="trailerUrl"
          v-model="form.trailerUrl"
          type="url"
          placeholder="https://youtube.com/embed/..."
          class="form-input"
          :class="{ 'input-error': errors.trailerUrl }"
          required
        />
        <p v-if="errors.trailerUrl" class="error-message">{{ errors.trailerUrl }}</p>
      </div>

      <!-- General Error -->
      <div v-if="error" class="error-box">
        {{ error }}
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="close" :disabled="isLoading">
          Cancel
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">
            {{ isEditing ? 'Update Movie' : 'Create Movie' }}
          </span>
          <span v-else>Saving...</span>
        </button>
      </div>
    </form>
  </base-modal>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  movieId: {
    type: String,
    default: null
  },
  initialMovie: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'close'])

const form = reactive({
  title: '',
  description: '',
  releaseDate: '',
  posterUrl: '',
  trailerUrl: ''
})

const errors = reactive({
  title: '',
  description: '',
  releaseDate: '',
  posterUrl: '',
  trailerUrl: ''
})

const error = ref(null)

const isEditing = ref(false)

onMounted(() => {
  if (props.initialMovie) {
    isEditing.value = true
    form.title = props.initialMovie.title
    form.description = props.initialMovie.description
    form.releaseDate = props.initialMovie.releaseDate?.split('T')[0] || ''
    form.posterUrl = props.initialMovie.posterUrl
    form.trailerUrl = props.initialMovie.trailerUrl
  }
})

const validateForm = () => {
  let isValid = true

  // Reset errors
  errors.title = ''
  errors.description = ''
  errors.releaseDate = ''
  errors.posterUrl = ''
  errors.trailerUrl = ''
  error.value = null

  // Title validation
  if (!form.title.trim()) {
    errors.title = 'Title is required'
    isValid = false
  } else if (form.title.length < 2) {
    errors.title = 'Title must be at least 2 characters'
    isValid = false
  }

  // Description validation
  if (!form.description.trim()) {
    errors.description = 'Description is required'
    isValid = false
  } else if (form.description.length < 20) {
    errors.description = 'Description must be at least 20 characters'
    isValid = false
  }

  // Release date validation
  if (!form.releaseDate) {
    errors.releaseDate = 'Release date is required'
    isValid = false
  }

  // Poster URL validation
  if (!form.posterUrl.trim()) {
    errors.posterUrl = 'Poster URL is required'
    isValid = false
  } else if (!isValidUrl(form.posterUrl)) {
    errors.posterUrl = 'Please enter a valid URL'
    isValid = false
  }

  // Trailer URL validation
  if (!form.trailerUrl.trim()) {
    errors.trailerUrl = 'Trailer URL is required'
    isValid = false
  } else if (!isValidUrl(form.trailerUrl)) {
    errors.trailerUrl = 'Please enter a valid URL'
    isValid = false
  }

  return isValid
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  emit('submit', {
    ...form,
    isEditing: isEditing.value,
    movieId: props.movieId
  })
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.movie-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  letter-spacing: 0.3px;
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  font-size: var(--font-size-base);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
  font-family: var(--font-family);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-gold);
  background-color: rgba(255, 193, 7, 0.05);
}

.form-input.input-error,
.form-textarea.input-error {
  border-color: var(--danger);
  background-color: rgba(244, 67, 54, 0.05);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--danger);
  margin: 0;
}

.error-box {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  color: #ff6b6b;
  font-size: var(--font-size-sm);
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
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
