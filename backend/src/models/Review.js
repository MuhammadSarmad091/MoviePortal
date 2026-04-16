const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Review content is required'],
    minlength: [10, 'Review must be at least 10 characters long']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field to expose _id as id
reviewSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Configure toJSON to include virtuals
reviewSchema.set('toJSON', { virtuals: true });

/**
 * Recalculate the parent Movie's denormalized ratings and reviewCount
 * using an aggregation over all reviews for that movie.
 */
reviewSchema.statics.recalculateMovieStats = async function (movieId) {
  const Movie = mongoose.model('Movie');
  const stats = await this.aggregate([
    { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
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

// Auto-update parent Movie stats after a review is created or updated
reviewSchema.post('save', async function () {
  await this.constructor.recalculateMovieStats(this.movieId);
});

// Auto-update parent Movie stats after a review is deleted via findOneAndDelete / findByIdAndDelete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await mongoose.model('Review').recalculateMovieStats(doc.movieId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
