const Movie = require('../models/Movie');
const Review = require('../models/Review');

const getAllMovies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const movies = await Movie.find()
      .populate('userId', 'username')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Movie.countDocuments();

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

    const movie = await Movie.findById(id)
      .populate('userId', 'username email');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const reviewCount = await Review.countDocuments({ movieId: id });

    res.json({
      movie,
      reviewCount
    });
  } catch (error) {
    next(error);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const { title, description, releaseDate, posterUrl, trailerUrl } = req.body;

    // Check if movie with same title already exists
    const existingMovie = await Movie.findOne({ title });
    if (existingMovie) {
      return res.status(400).json({ message: 'Movie with this title already exists' });
    }

    const movie = new Movie({
      title,
      description,
      releaseDate,
      posterUrl,
      trailerUrl,
      userId: req.userId
    });

    await movie.save();

    res.status(201).json({
      message: 'Movie created successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, releaseDate, posterUrl, trailerUrl } = req.body;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user is the owner
    if (movie.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to update this movie' });
    }

    // Check if new title is unique (if title is being changed)
    if (title && title !== movie.title) {
      const existingMovie = await Movie.findOne({ title });
      if (existingMovie) {
        return res.status(400).json({ message: 'Movie with this title already exists' });
      }
    }

    // Update fields
    if (title) movie.title = title;
    if (description) movie.description = description;
    if (releaseDate) movie.releaseDate = releaseDate;
    if (posterUrl) movie.posterUrl = posterUrl;
    if (trailerUrl) movie.trailerUrl = trailerUrl;
    movie.updatedAt = Date.now();

    await movie.save();

    res.json({
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user is the owner
    if (movie.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this movie' });
    }

    // Delete all reviews associated with the movie
    await Review.deleteMany({ movieId: id });

    await Movie.findByIdAndDelete(id);

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!title) {
      return res.status(400).json({ message: 'Title search parameter is required' });
    }

    const searchRegex = new RegExp(title, 'i'); // Case-insensitive search

    const movies = await Movie.find({ title: searchRegex })
      .populate('userId', 'username')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Movie.countDocuments({ title: searchRegex });

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Aggregation pipeline to get movies with review counts and rankings
    const movies = await Movie.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movieId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.rating' },
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { reviewCount: -1 }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      },
      {
        $project: {
          total: { $arrayElemAt: ['$metadata.total', 0] },
          movies: '$data'
        }
      }
    ]);

    const result = movies[0] || { total: 0, movies: [] };
    const total = result.total || 0;

    // Add rank to each movie
    const rankedMovies = result.movies.map((movie, index) => ({
      ...movie,
      rank: skip + index + 1,
      reviewCount: movie.reviewCount || 0,
      averageRating: movie.averageRating || 0
    }));

    res.json({
      movies: rankedMovies,
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
    const { id } = req.params;

    const movie = await Movie.findById(id)
      .populate('userId', 'username email');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Compute review count for this movie
    const reviewCount = await Review.countDocuments({ movieId: id });

    // Count how many movies have strictly greater review counts
    const greaterAgg = await Review.aggregate([
      { $group: { _id: '$movieId', count: { $sum: 1 } } },
      { $match: { count: { $gt: reviewCount } } },
      { $count: 'greater' }
    ]);

    const countGreater = (greaterAgg[0] && greaterAgg[0].greater) ? greaterAgg[0].greater : 0;
    const rank = countGreater + 1;

    res.json({
      movie,
      reviewCount,
      rank
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
