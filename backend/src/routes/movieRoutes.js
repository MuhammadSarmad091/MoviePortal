const express = require('express');
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  getRankedMovies
} = require('../controllers/movieController');
const { authenticate } = require('../middleware/authenticate');
const { validateMovieInput } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getAllMovies);
router.get('/search', searchMovies);
router.get('/ranked', getRankedMovies);
router.get('/:id', getMovieById);

// Protected routes
router.post('/', authenticate, validateMovieInput, createMovie);
router.put('/:id', authenticate, validateMovieInput, updateMovie);
router.delete('/:id', authenticate, deleteMovie);

module.exports = router;
