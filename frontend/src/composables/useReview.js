import { ref } from 'vue'
import { useApi } from './useApi'

export function useReview() {
  const { api } = useApi()
  const reviews = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchReviews = async (movieId, page = 1) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/movies/${movieId}/reviews?page=${page}`)
      reviews.value = response.data.reviews || []
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching reviews:', err)
    } finally {
      loading.value = false
    }
  }

  const addReview = async (movieId, reviewData) => {
    try {
      const response = await api.post(`/movies/${movieId}/reviews`, reviewData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  const updateReview = async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`)
    } catch (err) {
      error.value = err.message
      throw err
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
