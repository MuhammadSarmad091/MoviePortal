const { validatePagination } = require('../utils/pagination');
const reviewService = require('../services/reviewService');

const getReviewsForMovie = async (req, res, next) => {
  try {
    const { id } = req.params; // movie id
    const { page, limit } = validatePagination(req.query.page, req.query.limit);
    const { reviews, total } = await reviewService.getReviewsForMovie({
      movieId: id,
      page,
      limit
    });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        reviewsPerPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
};

const createReviewForMovie = async (req, res, next) => {
  try {
    const { id } = req.params; // movie id
    const { content, rating } = req.body;

    const result = await reviewService.createReviewForMovie({
      movieId: id,
      content,
      rating,
      userId: req.userId
    });
    if (result.status === 'MOVIE_NOT_FOUND') {
      return res.status(404).json({ message: 'Movie not found' });
    }
    if (result.status === 'REVIEW_EXISTS') {
      return res.status(400).json({ message: 'You have already reviewed this movie. You can only have one review per movie.' });
    }
    res.status(201).json({ message: 'Review created', review: result.review });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params; // review id
    const { content, rating } = req.body;

    const result = await reviewService.updateReview({
      reviewId: id,
      userId: req.userId,
      content,
      rating
    });
    if (result.status === 'NOT_FOUND') return res.status(404).json({ message: 'Review not found' });
    if (result.status === 'FORBIDDEN') {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }
    res.json({ message: 'Review updated', review: result.review });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params; // review id

    const result = await reviewService.deleteReview({
      reviewId: id,
      userId: req.userId
    });
    if (result.status === 'NOT_FOUND') return res.status(404).json({ message: 'Review not found' });
    if (result.status === 'FORBIDDEN') {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewsForMovie,
  createReviewForMovie,
  updateReview,
  deleteReview
};
