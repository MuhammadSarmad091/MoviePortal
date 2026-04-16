const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

const listMovies = async ({ page, limit }) => {
  const skip = (page - 1) * limit;
  const result = await Movie.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        movies: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: '_user',
              pipeline: [{ $project: { username: 1 } }]
            }
          },
          { $unwind: { path: '$_user', preserveNullAndEmptyArrays: true } },
          { $addFields: { id: { $toString: '$_id' }, userId: { $ifNull: ['$_user', '$userId'] } } },
          { $project: { _user: 0 } }
        ],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  return {
    movies: result[0]?.movies || [],
    total: result[0]?.totalCount[0]?.count || 0
  };
};

const getMovieById = async (movieId) => {
  return Movie.findById(movieId).populate('userId', 'username email');
};

const createMovie = async ({ title, description, releaseDate, posterUrl, trailerUrl, userId }) => {
  const movie = new Movie({ title, description, releaseDate, posterUrl, trailerUrl, userId });
  return movie.save();
};

const updateMovie = async ({ movieId, userId, updates }) => {
  const allowed = {};
  ['title', 'description', 'releaseDate', 'posterUrl', 'trailerUrl'].forEach((key) => {
    if (updates[key] !== undefined) {
      allowed[key] = updates[key];
    }
  });
  allowed.updatedAt = new Date();

  const updated = await Movie.findOneAndUpdate(
    { _id: movieId, userId: new mongoose.Types.ObjectId(userId) },
    { $set: allowed },
    { new: true, runValidators: true }
  );
  if (updated) {
    return { status: 'OK', movie: updated };
  }

  const exists = await Movie.exists({ _id: movieId });
  if (!exists) return { status: 'NOT_FOUND' };
  return { status: 'FORBIDDEN' };
};

const deleteMovie = async ({ movieId, userId }) => {
  const session = await Movie.startSession();
  session.startTransaction();
  try {
    const movie = await Movie.findById(movieId).session(session);
    if (!movie) {
      await session.abortTransaction();
      return { status: 'NOT_FOUND' };
    }
    if (movie.userId.toString() !== userId) {
      await session.abortTransaction();
      return { status: 'FORBIDDEN' };
    }
    await Review.deleteMany({ movieId }).session(session);
    await Movie.findByIdAndDelete(movieId).session(session);
    await session.commitTransaction();
    return { status: 'OK' };
  } finally {
    session.endSession();
  }
};

const searchMoviesByTitle = async ({ title, page, limit }) => {
  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(title, 'i');
  const result = await Movie.aggregate([
    { $match: { title: searchRegex } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        movies: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: '_user',
              pipeline: [{ $project: { username: 1 } }]
            }
          },
          { $unwind: { path: '$_user', preserveNullAndEmptyArrays: true } },
          { $addFields: { id: { $toString: '$_id' }, userId: { $ifNull: ['$_user', '$userId'] } } },
          { $project: { _user: 0 } }
        ],
        totalCount: [{ $count: 'count' }]
      }
    }
  ]);

  return {
    movies: result[0]?.movies || [],
    total: result[0]?.totalCount[0]?.count || 0
  };
};

const getRankedMovies = async ({ page, limit }) => {
  const skip = (page - 1) * limit;
  const [movies, total] = await Promise.all([
    Movie.find({})
      .populate('userId', 'username')
      .sort({ reviewCount: -1, ratings: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Movie.countDocuments()
  ]);

  const rankedMovies = movies.map((movie, index) => ({
    ...movie.toObject(),
    rank: skip + index + 1
  }));

  return { movies: rankedMovies, total };
};

const getMovieByIdWithRank = async (movieId) => {
  const movie = await getMovieById(movieId);
  if (!movie) return null;
  const reviewCount = movie.reviewCount || 0;
  const ratings = movie.ratings || 0;

  const rankHigherCount = await Movie.countDocuments({
    $or: [
      { reviewCount: { $gt: reviewCount } },
      { reviewCount, ratings: { $gt: ratings } }
    ]
  });

  return {
    movie,
    reviewCount,
    rank: rankHigherCount + 1
  };
};

module.exports = {
  listMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMoviesByTitle,
  getRankedMovies,
  getMovieByIdWithRank
};
