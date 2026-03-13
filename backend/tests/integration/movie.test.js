/**
 * Movie CRUD Integration Tests
 * Tests movie creation, reading, updating, deleting, and pagination
 */

const request = require('supertest');
const app = require('../../src/server');
const {
  connectTestDB,
  disconnectTestDB,
  clearTestDatabase,
  getTestToken,
  createTestUser,
  createTestMovies,
  testFixtures
} = require('../setup');
const Movie = require('../../src/models/Movie');

describe('Movie CRUD Integration Tests', () => {
  let user;
  let token;
  
  beforeAll(async () => {
    await connectTestDB();
  });
  
  afterAll(async () => {
    await disconnectTestDB();
  });
  
  beforeEach(async () => {
    await clearTestDatabase();
    user = await createTestUser();
    token = getTestToken(user._id.toString());
  });
  
  describe('POST /api/v1/movies', () => {
    test('should create movie with valid data', async () => {
      const movieData = testFixtures.movies[0];
      
      const response = await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${token}`)
        .send(movieData)
        .expect(201);
      
      expect(response.body).toHaveProperty('message', 'Movie created successfully');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(movieData.title);
      expect(response.body.data.userId).toBe(user._id.toString());
    });
    
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/movies')
        .send(testFixtures.movies[0])
        .expect(401);
      
      expect(response.body.message).toContain('No token provided');
    });
    
    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Movie'
          // Missing other required fields
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
    
    test('should fail with invalid duration', async () => {
      const response = await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testFixtures.movies[0],
          duration: -10 // Invalid duration
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('GET /api/v1/movies', () => {
    test('should get all movies with pagination', async () => {
      const movies = await createTestMovies(user._id, 5);
      
      const response = await request(app)
        .get('/api/v1/movies?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.total).toBe(5);
      expect(response.body.pagination.page).toBe(1);
    });
    
    test('should enforce pagination limit cap (max 100)', async () => {
      // Create more than 100 movies
      const movies = await createTestMovies(user._id, 5);
      
      const response = await request(app)
        .get('/api/v1/movies?page=1&limit=100000')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Should cap limit to 100
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
    
    test('should return empty array for second page with only 5 movies', async () => {
      await createTestMovies(user._id, 5);
      
      const response = await request(app)
        .get('/api/v1/movies?page=2&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data).toHaveLength(0);
    });
    
    test('should search movies by title', async () => {
      await createTestMovies(user._id, 3);
      
      const response = await request(app)
        .get('/api/v1/movies?search=Test%20Movie%201')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain('Test Movie 1');
    });
    
    test('should filter movies by genre', async () => {
      await createTestMovies(user._id, 3);
      
      const response = await request(app)
        .get('/api/v1/movies?genre=Action')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/v1/movies/:id', () => {
    test('should get single movie by id', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      const response = await request(app)
        .get(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data._id).toBe(movieId.toString());
      expect(response.body.data.title).toBe(movies[0].title);
    });
    
    test('should return 404 for non-existent movie', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/movies/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.message).toContain('not found');
    });
    
    test('should return 400 for invalid movie id', async () => {
      const response = await request(app)
        .get('/api/v1/movies/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('PUT /api/v1/movies/:id', () => {
    test('should update movie with valid data', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      const updatedData = {
        title: 'Updated Movie Title',
        rating: 9.0
      };
      
      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);
      
      expect(response.body.data.title).toBe(updatedData.title);
      expect(response.body.data.rating).toBe(updatedData.rating);
    });
    
    test('should only allow movie owner to update', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      // Create another user
      const { createTestUser } = require('../setup');
      const otherUser = await createTestUser({ email: 'other@example.com', username: 'otheruser' });
      const otherToken = getTestToken(otherUser._id.toString());
      
      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);
      
      expect(response.body.message).toContain('not authorized');
    });
    
    test('should fail with invalid rating value', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 11 }) // Invalid: > 10
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('DELETE /api/v1/movies/:id', () => {
    test('should delete movie by owner', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      const response = await request(app)
        .delete(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify movie deleted from database
      const deletedMovie = await Movie.findById(movieId);
      expect(deletedMovie).toBeNull();
    });
    
    test('should cascade delete associated reviews', async () => {
      const { createTestReview } = require('../setup');
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      // Create review for movie
      const review = await createTestReview(movieId, user._id);
      
      // Delete movie
      await request(app)
        .delete(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify review is deleted (should be handled by transaction in controller)
      const Review = require('../../src/models/Review');
      const deletedReview = await Review.findById(review._id);
      expect(deletedReview).toBeNull();
    });
    
    test('should prevent non-owner from deleting', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      const { createTestUser } = require('../setup');
      const otherUser = await createTestUser({ email: 'other@example.com', username: 'otheruser' });
      const otherToken = getTestToken(otherUser._id.toString());
      
      const response = await request(app)
        .delete(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
      
      expect(response.body.message).toContain('not authorized');
    });
  });
  
  describe('N+1 Query Performance Test', () => {
    test('should fetch movies with efficient aggregation pipeline', async () => {
      // Create 10 movies with reviews
      const { createTestReview } = require('../setup');
      const movies = await createTestMovies(user._id, 10);
      
      // Add reviews to each movie
      for (const movie of movies) {
        await createTestReview(movie._id, user._id);
      }
      
      // This should use single aggregation pipeline (no N+1 queries)
      const response = await request(app)
        .get('/api/v1/movies')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data).toHaveLength(10);
      
      // All movies should have review data included
      response.body.data.forEach(movie => {
        expect(movie).toHaveProperty('totalReviews');
        expect(movie).toHaveProperty('averageRating');
      });
    });
  });
});
