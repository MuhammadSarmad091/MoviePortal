<template>
  <div
    class="modal-overlay"
    @click.self="closeModal"
    @keydown.esc="closeModal"
    role="presentation"
  >
    <div
      ref="modalContent"
      class="modal-content"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
    >
      <button
        class="modal-close"
        @click="closeModal"
        title="Close modal"
        aria-label="Close modal"
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['close'])
defineProps({
  titleId: {
    type: String,
    default: 'modal-title'
  },
  descId: {
    type: String,
    default: 'modal-description'
  }
})

const modalContent = ref(null)

const closeModal = () => {
  emit('close')
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    closeModal()
  }
}

const trapFocus = (e) => {
  if (!modalContent.value) return

  const focusableElements = modalContent.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (e.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}

onMounted(async () => {
  // Add keyboard event listeners immediately
  document.addEventListener('keydown', handleKeyDown)
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden'

  // Function to try focusing the title input field
  const focusTitleInput = () => {
    if (!modalContent.value) return false

    // First, try to find the title input by id
    const titleInput = modalContent.value.querySelector('#title')
    if (titleInput) {
      titleInput.focus()
      return true
    }

    // Fallback: find the first input field (excluding the close button area)
    const inputs = modalContent.value.querySelectorAll('input, textarea')
    if (inputs.length > 0) {
      inputs[0].focus()
      return true
    }

    return false
  }

  // Try multiple times with increasing delays to ensure slot content is rendered
  await nextTick()
  focusTitleInput()

  // Add focus trap for Tab key
  if (modalContent.value) {
    modalContent.value.addEventListener('keydown', trapFocus)
  }
})

onUnmounted(() => {
  // Remove event listeners
  document.removeEventListener('keydown', handleKeyDown)
  if (modalContent.value) {
    modalContent.value.removeEventListener('keydown', trapFocus)
  }

  // Restore body scroll
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  position: relative;
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.modal-close:hover {
  color: var(--accent-gold);
  background-color: rgba(255, 184, 82, 0.1);
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
  }
}
</style>
