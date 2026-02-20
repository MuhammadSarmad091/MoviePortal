const Review = require('../models/Review');
const Movie = require('../models/Movie');
const mongoose = require('mongoose');

async function updateMovieRating(movieId) {
  // Robust match: compare stringified movieId so aggregation works whether
  // reviews.movieId is stored as ObjectId or as a string.
  const movieIdStr = movieId.toString()
  const stats = await Review.aggregate([
    { $match: { $expr: { $eq: [ { $toString: '$movieId' }, movieIdStr ] } } },
    { $group: { _id: '$movieId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    const { avgRating, count } = stats[0];
    const rounded = Math.round((avgRating + Number.EPSILON) * 10) / 10 // one decimal
    console.log(`updateMovieRating: movieId=${movieId} count=${count} avg=${avgRating} rounded=${rounded}`)
    await Movie.findByIdAndUpdate(movieId, { ratings: rounded });
  } else {
    console.log(`updateMovieRating: movieId=${movieId} no reviews, setting 0`)
    await Movie.findByIdAndUpdate(movieId, { ratings: 0 });
  }
}

const getReviewsForMovie = async (req, res, next) => {
  try {
    const { id } = req.params; // movie id
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ movieId: id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ movieId: id });

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

    // Ensure movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ movieId: id, userId: req.userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie. You can only have one review per movie.' });
    }

    const review = new Review({
      content,
      rating,
      movieId: id,
      userId: req.userId
    });

    await review.save();

    // Update movie average rating
    await updateMovieRating(id);

    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params; // review id
    const { content, rating } = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }

    if (content) review.content = content;
    if (rating) review.rating = rating;
    review.updatedAt = Date.now();

    await review.save();

    // Update movie average rating
    await updateMovieRating(review.movieId);

    res.json({ message: 'Review updated', review });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params; // review id

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    const movieId = review.movieId;

    await Review.findByIdAndDelete(id);

    // Update movie average rating
    await updateMovieRating(movieId);

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
