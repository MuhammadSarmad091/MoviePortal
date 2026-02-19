<template>
  <div class="trailer-section">
    <div class="trailer-container">
      <iframe
        v-if="trailerEmbedUrl"
        :src="trailerEmbedUrl"
        title="Movie Trailer"
        class="trailer-iframe"
        allowfullscreen
        allow="autoplay"
      ></iframe>
      <div v-else class="trailer-placeholder">
        <span class="placeholder-icon">🎥</span>
        <p>Trailer not available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  trailerUrl: {
    type: String,
    default: ''
  }
})

const trailerEmbedUrl = computed(() => {
  if (!props.trailerUrl) return null

  // Handle YouTube URLs
  const youtubeMatch = props.trailerUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )

  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // If it's already an embed URL or other iframe source
  if (props.trailerUrl.includes('embed') || props.trailerUrl.includes('iframe')) {
    return props.trailerUrl
  }

  return null
})
</script>

<style scoped>
.trailer-section {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.trailer-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.trailer-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.trailer-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-tertiary);
  background: linear-gradient(135deg, var(--bg-hover), var(--border-color));
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.trailer-placeholder p {
  font-size: var(--font-size-sm);
  margin: 0;
}
</style>
