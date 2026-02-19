<template>
  <base-modal @close="close">
    <h2>Delete Movie</h2>
    <p class="confirm-message">
      Are you sure you want to delete <strong>{{ movieTitle }}</strong>?
    </p>
    <p class="warning-text">⚠️ This action cannot be undone.</p>

    <div class="modal-actions">
      <button class="btn-secondary" @click="close">Cancel</button>
      <button class="btn-danger" @click="confirmDelete" :disabled="isDeleting">
        <span v-if="!isDeleting">Delete</span>
        <span v-else>Deleting...</span>
      </button>
    </div>
  </base-modal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  movieTitle: {
    type: String,
    required: true
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'close'])

const confirmDelete = () => {
  emit('confirm')
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
h2 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.confirm-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.warning-text {
  font-size: var(--font-size-sm);
  color: var(--danger);
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 3px solid var(--danger);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.modal-actions {
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

.btn-secondary:hover {
  background-color: var(--border-color);
  border-color: var(--accent-gold);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.btn-danger:hover:not(:disabled) {
  background-color: #da190b;
  transform: translateY(-2px);
}

.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
