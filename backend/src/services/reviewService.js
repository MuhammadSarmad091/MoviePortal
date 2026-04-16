const Review = require('../models/Review');
const Movie = require('../models/Movie');

const getReviewsForMovie = async ({ movieId, page, limit }) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ movieId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ movieId })
  ]);
  return { reviews, total };
};

const createReviewForMovie = async ({ movieId, content, rating, userId }) => {
  const movie = await Movie.findById(movieId);
  if (!movie) return { status: 'MOVIE_NOT_FOUND' };

  const existingReview = await Review.findOne({ movieId, userId });
  if (existingReview) return { status: 'REVIEW_EXISTS' };

  const review = new Review({ content, rating, movieId, userId });
  try {
    await review.save(); // post-save hook recalculates movie stats automatically
  } catch (error) {
    if (error && error.code === 11000) {
      return { status: 'REVIEW_EXISTS' };
    }
    throw error;
  }
  return { status: 'OK', review };
};

const updateReview = async ({ reviewId, userId, content, rating }) => {
  const review = await Review.findById(reviewId);
  if (!review) return { status: 'NOT_FOUND' };
  if (review.userId.toString() !== userId) return { status: 'FORBIDDEN' };

  if (content !== undefined) review.content = content;
  if (rating !== undefined) review.rating = rating;
  review.updatedAt = Date.now();
  await review.save(); // post-save hook recalculates movie stats automatically

  return { status: 'OK', review };
};

const deleteReview = async ({ reviewId, userId }) => {
  const review = await Review.findById(reviewId);
  if (!review) return { status: 'NOT_FOUND' };
  if (review.userId.toString() !== userId) return { status: 'FORBIDDEN' };

  await Review.findByIdAndDelete(reviewId); // post-delete hook recalculates movie stats automatically
  return { status: 'OK' };
};

module.exports = {
  getReviewsForMovie,
  createReviewForMovie,
  updateReview,
  deleteReview
};
