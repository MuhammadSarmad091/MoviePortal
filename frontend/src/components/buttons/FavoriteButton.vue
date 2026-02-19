<template>
  <button
    class="favorite-button"
    :class="{ 'is-favorite': isFavorite }"
    @click="handleClick"
    :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
  >
    {{ isFavorite ? '❤️' : '🤍' }}
  </button>
</template>

<script setup>
const props = defineProps({
  movieId: {
    type: String,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

const handleClick = () => {
  emit('toggle')
}
</script>

<style scoped>
.favorite-button {
  background: none;
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.favorite-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-gold);
}

.favorite-button.is-favorite {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: var(--accent-gold);
}
</style>
