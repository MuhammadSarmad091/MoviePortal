<template>
  <button
    class="favorite-button"
    :class="{ favorite: isFavorite }"
    @click="toggleFavorite"
    :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
  >
    {{ isFavorite ? '❤️' : '🤍' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

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

const isFavoriteLocal = ref(props.isFavorite)

const toggleFavorite = () => {
  isFavoriteLocal.value = !isFavoriteLocal.value
  emit('toggle')
}
</script>

<style scoped>
.favorite-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform var(--transition-fast);
  padding: 0.5rem;
}

.favorite-button:hover {
  transform: scale(1.2);
}

.favorite-button.favorite {
  color: #ff1744;
}
</style>
