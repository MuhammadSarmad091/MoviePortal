/**
 * Test Setup and Utilities
 * Handles database connection, cleanup, and test fixtures for integration tests
 */

require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { testConfig, validateTestEnvironment } = require('../src/config/testEnvironment');

// Validate test environment at startup
try {
  validateTestEnvironment();
} catch (error) {
  console.error('⚠️  Test Environment Validation Error:', error.message);
  process.exit(1);
}

// Test database connection setup
let mongoConnection = null;

/**
 * Connect to test MongoDB database
 */
async function connectTestDB() {
  try {
    mongoConnection = await mongoose.connect(testConfig.database.mongoUri);
    console.log('✓ Connected to test database');
    return mongoConnection;
  } catch (error) {
    console.error('✗ Failed to connect to test database:', error.message);
    throw error;
  }
}

/**
 * Disconnect from test database
 */
async function disconnectTestDB() {
  if (mongoConnection) {
    await mongoose.disconnect();
    console.log('✓ Disconnected from test database');
  }
}

/**
 * Clear all collections in test database
 */
async function clearTestDatabase() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  console.log('✓ Cleared test database collections');
}

/**
 * Drop entire test database
 */
async function dropTestDatabase() {
  if (mongoConnection) {
    await mongoose.connection.dropDatabase();
    console.log('✓ Dropped test database');
  }
}

/**
 * Get valid JWT token for testing
 * @param {String} userId - User ID to encode in token
 * @param {Object} options - Additional token options
 */
function getTestToken(userId, options = {}) {
  const payload = {
    userId,
    ...options
  };
  
  return jwt.sign(payload, testConfig.jwt.secret, {
    expiresIn: testConfig.jwt.expiry
  });
}

/**
 * Get expired JWT token for testing
 * @param {String} userId - User ID to encode in token
 */
function getExpiredToken(userId) {
  const payload = { userId };
  
  return jwt.sign(payload, testConfig.jwt.secret, {
    expiresIn: '-1h' // Already expired
  });
}

/**
 * Generate invalid JWT token (wrong signature)
 */
function getInvalidToken() {
  return jwt.sign({ userId: '123' }, 'wrong-secret', {
    expiresIn: '7d'
  });
}

/**
 * Test fixtures - Sample data for consistent testing
 */
const testFixtures = {
  users: [
    {
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'Password123!',
      displayName: 'Test User 1'
    },
    {
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'Password123!',
      displayName: 'Test User 2'
    },
    {
      username: 'testuser3',
      email: 'test3@example.com',
      password: 'Password123!',
      displayName: 'Test User 3'
    }
  ],
  
  movies: [
    {
      title: 'Test Movie 1',
      description: 'A test movie description',
      releaseDate: new Date('2023-01-15'),
      genre: 'Action',
      director: 'Test Director',
      cast: ['Actor 1', 'Actor 2'],
      rating: 8.5,
      duration: 120,
      posterUrl: 'https://example.com/poster1.jpg',
      trailerUrl: 'https://example.com/trailer1.mp4'
    },
    {
      title: 'Test Movie 2',
      description: 'Another test movie',
      releaseDate: new Date('2023-06-20'),
      genre: 'Drama',
      director: 'Another Director',
      cast: ['Actor 3', 'Actor 4'],
      rating: 7.8,
      duration: 140,
      posterUrl: 'https://example.com/poster2.jpg',
      trailerUrl: 'https://example.com/trailer2.mp4'
    },
    {
      title: 'Test Movie 3',
      description: 'Third test movie',
      releaseDate: new Date('2023-12-01'),
      genre: 'Comedy',
      director: 'Comedy Director',
      cast: ['Actor 5'],
      rating: 6.5,
      duration: 100,
      posterUrl: 'https://example.com/poster3.jpg',
      trailerUrl: 'https://example.com/trailer3.mp4'
    }
  ],
  
  reviews: [
    {
      rating: 8,
      content: 'This is an amazing movie with great cinematography and plot!'
    },
    {
      rating: 6,
      content: 'It was an okay movie, not what I expected but still entertaining.'
    },
    {
      rating: 9,
      content: 'Excellent film, definitely worth watching and highly recommended for everyone.'
    }
  ]
};

/**
 * Create test user with password hashing
 */
async function createTestUser(userData = {}) {
  const User = require('../src/models/User');
  const defaultUser = testFixtures.users[0];
  
  const user = await User.create({
    ...defaultUser,
    ...userData
  });
  
  return user;
}

/**
 * Create multiple test users
 */
async function createTestUsers(count = 2) {
  const User = require('../src/models/User');
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const user = await User.create(testFixtures.users[i]);
    users.push(user);
  }
  
  return users;
}

/**
 * Create test movie
 */
async function createTestMovie(userId, movieData = {}) {
  const Movie = require('../src/models/Movie');
  const defaultMovie = testFixtures.movies[0];
  
  const movie = await Movie.create({
    ...defaultMovie,
    ...movieData,
    userId
  });
  
  return movie;
}

/**
 * Create multiple test movies
 */
async function createTestMovies(userId, count = 2) {
  const Movie = require('../src/models/Movie');
  const movies = [];
  
  for (let i = 0; i < count; i++) {
    const movie = await Movie.create({
      ...testFixtures.movies[i],
      userId
    });
    movies.push(movie);
  }
  
  return movies;
}

/**
 * Create test review
 */
async function createTestReview(movieId, userId, reviewData = {}) {
  const Review = require('../src/models/Review');
  const defaultReview = testFixtures.reviews[0];
  
  const review = await Review.create({
    ...defaultReview,
    ...reviewData,
    movieId,
    userId
  });
  
  return review;
}

/**
 * Create multiple test reviews for a movie
 */
async function createTestReviews(movieId, userId, count = 2) {
  const Review = require('../src/models/Review');
  const reviews = [];
  
  for (let i = 0; i < count; i++) {
    const review = await Review.create({
      ...testFixtures.reviews[i],
      movieId,
      userId
    });
    reviews.push(review);
  }
  
  return reviews;
}

module.exports = {
  // Database operations
  connectTestDB,
  disconnectTestDB,
  clearTestDatabase,
  dropTestDatabase,
  
  // Token utilities
  getTestToken,
  getExpiredToken,
  getInvalidToken,
  
  // Fixture management
  testFixtures,
  createTestUser,
  createTestUsers,
  createTestMovie,
  createTestMovies,
  createTestReview,
  createTestReviews
};
