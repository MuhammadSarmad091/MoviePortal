<template>
  <div class="share-button-container">
    <button
      class="share-button"
      @click="toggleShareMenu"
      title="Share this movie"
    >
      🔗 Share
    </button>

    <div v-if="showShareMenu" class="share-menu">
      <button
        class="share-option"
        @click="copyLink"
        @blur="closeMenu"
      >
        📋 Copy Link
      </button>
      <button
        class="share-option"
        @click="shareOnTwitter"
        @blur="closeMenu"
      >
        𝕏 Twitter
      </button>
      <button
        class="share-option"
        @click="shareOnFacebook"
        @blur="closeMenu"
      >
        f Facebook
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const showShareMenu = ref(false)

const toggleShareMenu = () => {
  showShareMenu.value = !showShareMenu.value
}

const closeMenu = () => {
  showShareMenu.value = false
}

const copyLink = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  alert('Link copied to clipboard!')
  closeMenu()
}

const shareOnTwitter = () => {
  const text = `Check out "${props.movie.title}" on MovieDB! ⭐`
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
  window.open(url, '_blank')
  closeMenu()
}

const shareOnFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
  window.open(url, '_blank')
  closeMenu()
}
</script>

<style scoped>
.share-button-container {
  position: relative;
}

.share-button {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.share-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-gold);
}

.share-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  margin-top: 0.5rem;
  overflow: hidden;
  z-index: 10;
  min-width: 150px;
  box-shadow: var(--shadow-lg);
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
  transition: all var(--transition-fast);
}

.share-option:hover {
  background-color: var(--bg-hover);
}

.share-option:focus {
  outline: none;
  background-color: var(--bg-hover);
}
</style>
