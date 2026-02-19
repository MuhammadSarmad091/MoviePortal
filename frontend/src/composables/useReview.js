import { ref } from 'vue'

export const useReview = () => {
  const reviews = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchReviews = async (movieId, page = 1, limit = 5) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `/api/movies/${movieId}/reviews?page=${page}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      reviews.value = data.reviews
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addReview = async (movieId, rating, content) => {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId,
          rating,
          content
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add review')
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateReview = async (reviewId, rating, content) => {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          content
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update review')
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteReview = async (reviewId) => {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview
  }
}
