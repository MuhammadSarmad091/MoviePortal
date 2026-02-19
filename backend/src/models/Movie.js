const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Movie description is required']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  posterUrl: {
    type: String,
    required: [true, 'Poster URL is required']
  },
  trailerUrl: {
    type: String,
    required: [true, 'Trailer URL is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
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

// Add virtual field to expose _id as id for frontend compatibility
movieSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtuals are included when converting to JSON
movieSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Movie', movieSchema);
