const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');

const recalculateMovieStats = async (movieId) => {
  const normalizedMovieId = mongoose.Types.ObjectId.isValid(movieId)
    ? new mongoose.Types.ObjectId(movieId)
    : movieId;
  const stats = await Review.aggregate([
    { $match: { movieId: normalizedMovieId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const count = stats[0]?.count || 0;
  const avg = stats[0]?.avgRating || 0;
  const rounded = Math.round((avg + Number.EPSILON) * 10) / 10;

  await Movie.findByIdAndUpdate(movieId, {
    ratings: count > 0 ? rounded : 0,
    reviewCount: count
  });
};

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
    await review.save();
  } catch (error) {
    if (error && error.code === 11000) {
      return { status: 'REVIEW_EXISTS' };
    }
    throw error;
  }
  await recalculateMovieStats(movieId);
  return { status: 'OK', review };
};

const updateReview = async ({ reviewId, userId, content, rating }) => {
  const review = await Review.findById(reviewId);
  if (!review) return { status: 'NOT_FOUND' };
  if (review.userId.toString() !== userId) return { status: 'FORBIDDEN' };

  if (content !== undefined) review.content = content;
  if (rating !== undefined) review.rating = rating;
  review.updatedAt = Date.now();
  await review.save();
  await recalculateMovieStats(review.movieId);

  return { status: 'OK', review };
};

const deleteReview = async ({ reviewId, userId }) => {
  const review = await Review.findById(reviewId);
  if (!review) return { status: 'NOT_FOUND' };
  if (review.userId.toString() !== userId) return { status: 'FORBIDDEN' };

  const movieId = review.movieId;
  await Review.findByIdAndDelete(reviewId);
  await recalculateMovieStats(movieId);
  return { status: 'OK' };
};

module.exports = {
  getReviewsForMovie,
  createReviewForMovie,
  updateReview,
  deleteReview,
  recalculateMovieStats
};
