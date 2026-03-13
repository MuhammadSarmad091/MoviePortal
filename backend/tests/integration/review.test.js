/**
 * Review Integration Tests
 * Tests review creation, updates, unique constraints, and rating calculations
 */

const request = require('supertest');
const app = require('../../src/server');
const {
  connectTestDB,
  disconnectTestDB,
  clearTestDatabase,
  getTestToken,
  createTestUser,
  createTestMovie,
  createTestReview,
  testFixtures
} = require('../setup');
const Review = require('../../src/models/Review');
const Movie = require('../../src/models/Movie');

describe('Review Integration Tests', () => {
  let user1, user2;
  let token1, token2;
  let movie;
  
  beforeAll(async () => {
    await connectTestDB();
  });
  
  afterAll(async () => {
    await disconnectTestDB();
  });
  
  beforeEach(async () => {
    await clearTestDatabase();
    
    // Create two test users
    user1 = await createTestUser();
    user2 = await createTestUser({
      username: 'testuser2',
      email: 'test2@example.com'
    });
    
    token1 = getTestToken(user1._id.toString());
    token2 = getTestToken(user2._id.toString());
    
    // Create test movie
    movie = await createTestMovie(user1._id);
  });
  
  describe('POST /api/v1/reviews', () => {
    test('should create review with valid data', async () => {
      const reviewData = {
        movieId: movie._id.toString(),
        rating: 5,
        text: 'Excellent movie!'
      };
      
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token1}`)
        .send(reviewData)
        .expect(201);
      
      expect(response.body.message).toContain('Review created successfully');
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.text).toBe('Excellent movie!');
      expect(response.body.data.userId).toBe(user1._id.toString());
    });
    
    test('should prevent duplicate reviews from same user', async () => {
      // Create first review
      await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          movieId: movie._id.toString(),
          rating: 5,
          text: 'Great movie'
        })
        .expect(201);
      
      // Try to create second review from same user for same movie
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          movieId: movie._id.toString(),
          rating: 3,
          text: 'Actually not so great'
        })
        .expect(400);
      
      expect(response.body.message).toContain('already reviewed');
    });
    
    test('should fail with invalid rating', async () => {
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          movieId: movie._id.toString(),
          rating: 11, // Invalid: > 5
          text: 'Test'
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
    
    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          movieId: movie._id.toString()
          // Missing rating
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
    
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/reviews')
        .send({
          movieId: movie._id.toString(),
          rating: 5,
          text: 'Test'
        })
        .expect(401);
      
      expect(response.body.message).toContain('No token provided');
    });
  });
  
  describe('GET /api/v1/reviews', () => {
    test('should get all reviews with pagination', async () => {
      // Create multiple reviews
      await createTestReview(movie._id, user1._id, { rating: 5 });
      await createTestReview(movie._id, user2._id, { rating: 4 });
      
      const response = await request(app)
        .get('/api/v1/reviews?page=1&limit=10')
        .expect(200);
      
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });
    
    test('should filter reviews by movie id', async () => {
      // Create another movie
      const movie2 = await createTestMovie(user1._id, { title: 'Second Movie' });
      
      // Create reviews for both movies
      await createTestReview(movie._id, user1._id);
      await createTestReview(movie2._id, user2._id);
      
      const response = await request(app)
        .get(`/api/v1/reviews?movieId=${movie._id}`)
        .expect(200);
      
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].movieId).toBe(movie._id.toString());
    });
    
    test('should enforce pagination limit cap (max 100)', async () => {
      const response = await request(app)
        .get('/api/v1/reviews?page=1&limit=1000000')
        .expect(200);
      
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });
  
  describe('GET /api/v1/reviews/:id', () => {
    test('should get single review by id', async () => {
      const review = await createTestReview(movie._id, user1._id, { rating: 5 });
      
      const response = await request(app)
        .get(`/api/v1/reviews/${review._id}`)
        .expect(200);
      
      expect(response.body.data._id).toBe(review._id.toString());
      expect(response.body.data.rating).toBe(5);
    });
    
    test('should return 404 for non-existent review', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/reviews/${fakeId}`)
        .expect(404);
      
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('PUT /api/v1/reviews/:id', () => {
    test('should update review with validation', async () => {
      const review = await createTestReview(movie._id, user1._id, { rating: 5, text: 'Great' });
      
      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          rating: 3,
          text: 'Actually not that great'
        })
        .expect(200);
      
      expect(response.body.data.rating).toBe(3);
      expect(response.body.data.text).toBe('Actually not that great');
    });
    
    test('should prevent non-owner from updating', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ rating: 1 })
        .expect(403);
      
      expect(response.body.message).toContain('not authorized');
    });
    
    test('should validate rating on update', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ rating: 10 }) // Invalid: > 5
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('DELETE /api/v1/reviews/:id', () => {
    test('should delete review by owner', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      expect(response.body.message).toContain('deleted successfully');
      
      // Verify deleted from database
      const deletedReview = await Review.findById(review._id);
      expect(deletedReview).toBeNull();
    });
    
    test('should prevent non-owner from deleting', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);
      
      expect(response.body.message).toContain('not authorized');
    });
  });
  
  describe('Review Rating Aggregation', () => {
    test('should correctly calculate movie average rating', async () => {
      // Create multiple reviews with different ratings
      await createTestReview(movie._id, user1._id, { rating: 5 });
      await createTestReview(movie._id, user2._id, { rating: 3 });
      
      // Create third user and review
      const user3 = await createTestUser({
        username: 'testuser3',
        email: 'test3@example.com'
      });
      await createTestReview(movie._id, user3._id, { rating: 4 });
      
      // Get movie details
      const response = await request(app)
        .get(`/api/v1/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      // Average rating should be (5 + 3 + 4) / 3 = 4
      expect(response.body.data.averageRating).toBe(4);
      expect(response.body.data.totalReviews).toBe(3);
    });
    
    test('should update movie rating when review is updated', async () => {
      const review = await createTestReview(movie._id, user1._id, { rating: 5 });
      
      // Update review to lower rating
      await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ rating: 2 })
        .expect(200);
      
      // Get updated movie
      const movieResponse = await request(app)
        .get(`/api/v1/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      expect(movieResponse.body.data.averageRating).toBe(2);
    });
    
    test('should update movie rating when review is deleted', async () => {
      // Create two reviews
      const review1 = await createTestReview(movie._id, user1._id, { rating: 5 });
      await createTestReview(movie._id, user2._id, { rating: 3 });
      
      // Delete one review
      await request(app)
        .delete(`/api/v1/reviews/${review1._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      // Get updated movie
      const movieResponse = await request(app)
        .get(`/api/v1/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      // Only one review remains with rating 3
      expect(movieResponse.body.data.averageRating).toBe(3);
      expect(movieResponse.body.data.totalReviews).toBe(1);
    });
  });
  
  describe('Race Condition Prevention', () => {
    test('should prevent duplicate reviews even under concurrent requests', async () => {
      // These requests might execute "simultaneously"
      // The unique index constraint should prevent duplicates
      
      const requests = [
        request(app)
          .post('/api/v1/reviews')
          .set('Authorization', `Bearer ${token1}`)
          .send({
            movieId: movie._id.toString(),
            rating: 5,
            text: 'First attempt'
          }),
        request(app)
          .post('/api/v1/reviews')
          .set('Authorization', `Bearer ${token1}`)
          .send({
            movieId: movie._id.toString(),
            rating: 4,
            text: 'Second attempt'
          })
      ];
      
      const results = await Promise.allSettled(requests);
      
      // One should succeed, one should fail
      const statuses = results
        .map(r => r.value ? r.value.status : r.reason.status)
        .sort();
      
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);
      
      // Only one review should exist
      const reviews = await Review.find({ movieId: movie._id, userId: user1._id });
      expect(reviews.length).toBe(1);
    });
  });
});
