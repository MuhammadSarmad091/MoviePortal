import { ref } from 'vue'

export const useMovie = () => {
  const movies = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchMovies = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (filters.genre) params.append('genre', filters.genre)
      if (filters.year) params.append('year', filters.year)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/movies?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json()
      movies.value = data.movies
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMovieById = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/movies/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch movie')
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchMovies = async (query) => {
    return fetchMovies({ search: query })
  }

  return {
    movies,
    loading,
    error,
    fetchMovies,
    fetchMovieById,
    searchMovies
  }
}
