<template>
  <div class="share-button-container" ref="container">
    <button
      class="share-button"
      @click="toggleShareMenu"
      title="Share this movie"
    >
      <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
    </button>

    <div v-if="showShareMenu" class="share-menu">
      <button class="share-option" @click="shareToClipboard">
        <i class="fa-solid fa-clipboard" aria-hidden="true"></i>
        Copy Link
      </button>
      <button class="share-option" @click="shareToTwitter">
        <i class="fa-brands fa-twitter" aria-hidden="true"></i>
        Twitter
      </button>
      <button class="share-option" @click="shareToFacebook">
        <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
        Facebook
      </button>
    </div>

    <div v-if="copied" class="copied-message">
      ✓ Copied to clipboard
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const showShareMenu = ref(false)
const copied = ref(false)
const container = ref(null)

const onDocumentClick = (e) => {
  if (!container.value) return
  if (container.value.contains(e.target)) return
  // clicked outside
  showShareMenu.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

const movieUrl = computed(() => {
  return `${window.location.origin}/movie/${props.movie.id || props.movie._id}`
})

const toggleShareMenu = () => {
  showShareMenu.value = !showShareMenu.value
}

const shareToClipboard = () => {
  const text = `Check out "${props.movie.title}" on MoviesPortal: ${movieUrl.value}`
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
      showShareMenu.value = false
    }, 2000)
  })
}

const shareToTwitter = () => {
  const text = `Check out "${props.movie.title}" on MoviesPortal!`
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(movieUrl.value)}`
  window.open(url, '_blank')
  showShareMenu.value = false
}

const shareToFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(movieUrl.value)}`
  window.open(url, '_blank')
  showShareMenu.value = false
}
</script>

<style scoped>
.share-button-container {
  position: relative;
}

.share-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--share-button-color, var(--text-primary));
  cursor: pointer;
  transition: transform var(--transition-fast);
  padding: 0.5rem;
}

.share-button:hover {
  transform: scale(1.2);
}

.share-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  min-width: 150px;
  z-index: 100;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.share-option {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: var(--font-size-sm);
}

.share-option i {
  margin-right: 0.6rem;
  width: 1.1rem;
  text-align: center;
}

.share-option:hover {
  background-color: var(--bg-hover);
  color: var(--accent-gold);
}

.copied-message {
  position: absolute;
  top: -30px;
  right: 0;
  background-color: var(--accent-gold);
  color: var(--bg-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
