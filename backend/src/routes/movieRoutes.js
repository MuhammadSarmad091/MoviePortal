const express = require('express');
const {
  getAllMovies,
  getMovieById,
  getMovieByIdWithRank,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  getRankedMovies
} = require('../controllers/movieController');
const { authenticate } = require('../middleware/authenticate');
const { validateMovieInput, validateReviewInput } = require('../middleware/validation');
const { getReviewsForMovie, createReviewForMovie } = require('../controllers/reviewController');

const router = express.Router();

// Public routes
router.get('/', getAllMovies);
router.get('/search', searchMovies);
router.get('/ranked', getRankedMovies);
router.get('/:id/with-rank', getMovieByIdWithRank);
router.get('/:id/reviews', getReviewsForMovie);
router.get('/:id', getMovieById);

// Protected routes
router.post('/', authenticate, validateMovieInput, createMovie);
router.post('/:id/reviews', authenticate, validateReviewInput, createReviewForMovie);
router.put('/:id', authenticate, validateMovieInput, updateMovie);
router.delete('/:id', authenticate, deleteMovie);

module.exports = router;
