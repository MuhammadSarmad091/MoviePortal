const { validatePagination } = require('../utils/pagination');
const movieService = require('../services/movieService');
const isTitleDuplicateError = (error) => (
  error && error.code === 11000 && error.keyPattern && error.keyPattern.title
);

const getAllMovies = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query.page, req.query.limit);
    const { movies, total } = await movieService.listMovies({ page, limit });

    res.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMovies: total,
        moviesPerPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await movieService.getMovieById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({
      movie,
      reviewCount: movie.reviewCount || 0
    });
  } catch (error) {
    next(error);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const { title, description, releaseDate, posterUrl, trailerUrl } = req.body;

    const movie = await movieService.createMovie({
      title,
      description,
      releaseDate,
      posterUrl,
      trailerUrl,
      userId: req.userId
    });

    res.status(201).json({
      message: 'Movie created successfully',
      movie
    });
  } catch (error) {
    if (isTitleDuplicateError(error)) {
      return res.status(400).json({ message: 'Movie with this title already exists' });
    }
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const result = await movieService.updateMovie({
      movieId: req.params.id,
      userId: req.userId,
      updates: req.body
    });

    if (result.status === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Movie not found' });
    }
    if (result.status === 'FORBIDDEN') {
      return res.status(403).json({ message: 'You are not authorized to update this movie' });
    }

    res.json({
      message: 'Movie updated successfully',
      movie: result.movie
    });
  } catch (error) {
    if (isTitleDuplicateError(error)) {
      return res.status(400).json({ message: 'Movie with this title already exists' });
    }
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const result = await movieService.deleteMovie({
      movieId: req.params.id,
      userId: req.userId
    });
    if (result.status === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Movie not found' });
    }
    if (result.status === 'FORBIDDEN') {
      return res.status(403).json({ message: 'You are not authorized to delete this movie' });
    }

    res.json({
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const searchMovies = async (req, res, next) => {
  try {
    const { title } = req.query;
    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    if (!title) {
      return res.status(400).json({ message: 'Title search parameter is required' });
    }

    const { movies, total } = await movieService.searchMoviesByTitle({ title, page, limit });

    res.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMovies: total,
        moviesPerPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRankedMovies = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query.page, req.query.limit);
    const { movies, total } = await movieService.getRankedMovies({ page, limit });

    res.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMovies: total,
        moviesPerPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// Return single movie with its review count and global rank
const getMovieByIdWithRank = async (req, res, next) => {
  try {
    const data = await movieService.getMovieByIdWithRank(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({
      movie: data.movie,
      reviewCount: data.reviewCount,
      rank: data.rank
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  getMovieByIdWithRank,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  getRankedMovies
};
