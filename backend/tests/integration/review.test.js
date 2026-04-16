/**
 * Review Integration Tests
 * Tests review creation, updates, unique constraints, and rating calculations.
 * All authenticated requests use httpOnly cookies — no Bearer tokens.
 */

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

const request = require('supertest');
const app = require('../../src/server');
const Review = require('../../src/models/Review');
const Movie = require('../../src/models/Movie');

const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME || 'auth_token';

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
    
    user1 = await createTestUser();
    user2 = await createTestUser({
      username: 'testuser2',
      email: 'test2@example.com'
    });
    
    token1 = getTestToken(user1._id.toString());
    token2 = getTestToken(user2._id.toString());
    
    movie = await createTestMovie(user1._id);
  });
  
  describe('POST /api/v1/movies/:id/reviews', () => {
    test('should prevent duplicate reviews from same user', async () => {
      const reviewData = {
        content: 'This is a great movie!',
        rating: 8
      };
      
      await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send(reviewData)
        .expect(201);
      
      const response = await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          content: 'Actually, second thoughts...',
          rating: 5
        })
        .expect(400);
      
      expect(response.body.message).toContain('already reviewed');
    });
    
    test('should fail with invalid rating (too high)', async () => {
      const response = await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          content: 'This movie is great!',
          rating: 11
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });

    test('should fail with invalid rating (too low)', async () => {
      const response = await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          content: 'This movie is terrible!',
          rating: 0
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
    
    test('should fail with missing content field', async () => {
      const response = await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          rating: 5
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });

    test('should fail with content too short', async () => {
      const response = await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          content: 'Good',
          rating: 5
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });

    test('should fail with missing rating field', async () => {
      const response = await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          content: 'This is a detailed review content with good length.'
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
    
    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/movies/${movie._id}/reviews`)
        .send({
          content: 'This is a detailed review.',
          rating: 5
        })
        .expect(401);
      
      expect(response.body.message).toContain('No token provided');
    });

    test('should fail if movie does not exist', async () => {
      const fakeMovieId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/v1/movies/${fakeMovieId}/reviews`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          content: 'This is a detailed review content.',
          rating: 5
        })
        .expect(404);
      
      expect(response.body.message).toContain('Movie not found');
    });
  });
  
  describe('GET /api/v1/movies/:id/reviews', () => {
    test('should get all reviews for a movie with pagination', async () => {
      await createTestReview(movie._id, user1._id, { rating: 8, content: 'Great film!' });
      await createTestReview(movie._id, user2._id, { rating: 7, content: 'Very good!' });
      
      const response = await request(app)
        .get(`/api/v1/movies/${movie._id}/reviews?page=1&limit=10`)
        .expect(200);
      
      expect(response.body.reviews).toHaveLength(2);
      expect(response.body.pagination.totalReviews).toBe(2);
      expect(response.body.pagination.currentPage).toBe(1);
    });

    test('should enforce pagination limit cap (max 100)', async () => {
      const response = await request(app)
        .get(`/api/v1/movies/${movie._id}/reviews?page=1&limit=1000000`)
        .expect(200);
      
      expect(response.body.pagination.reviewsPerPage).toBeLessThanOrEqual(100);
    });
  });
  
  describe('PUT /api/v1/reviews/:id', () => {
    test('should update review with valid data', async () => {
      const review = await createTestReview(movie._id, user1._id, { 
        rating: 5, 
        content: 'Originally thought it was great'
      });
      
      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({
          rating: 8,
          content: 'After rewatching, I think it is excellent actually!'
        })
        .expect(200);
      
      expect(response.body.review.rating).toBe(8);
      expect(response.body.review.content).toBe('After rewatching, I think it is excellent actually!');
    });
    
    test('should prevent non-owner from updating', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token2}`)
        .send({ 
          rating: 1,
          content: 'Updated content that is long enough for validation'
        })
        .expect(403);
      
      expect(response.body.message).toContain('not authorized');
    });
    
    test('should validate rating on update', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({ 
          rating: 11,
          content: 'Updated content that is long enough for validation'
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });

    test('should return 400 for invalid review id', async () => {
      const response = await request(app)
        .put(`/api/v1/reviews/invalid-id`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({ 
          rating: 5,
          content: 'Updated content that is long enough for validation'
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('DELETE /api/v1/reviews/:id', () => {
    test('should delete review by owner', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .expect(200);
      
      expect(response.body.message).toContain('Review deleted');
      
      const deletedReview = await Review.findById(review._id);
      expect(deletedReview).toBeNull();
    });
    
    test('should prevent non-owner from deleting', async () => {
      const review = await createTestReview(movie._id, user1._id);
      
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token2}`)
        .expect(403);
      
      expect(response.body.message).toContain('not authorized');
    });

    test('should return 404 for non-existent review', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/v1/reviews/${fakeId}`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .expect(404);
      
      expect(response.body.message).toContain('Review not found');
    });
  });
  
  describe('Review Rating Aggregation', () => {
    
    test('should update movie rating when review is updated', async () => {
      const review = await createTestReview(movie._id, user1._id, { rating: 8 });
      
      await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .send({ 
          rating: 4,
          content: 'Updated to a lower rating after rewatching the film'
        })
        .expect(200);
      
      const movieResponse = await request(app)
        .get(`/api/v1/movies/${movie._id}`)
        .expect(200);
      
      expect(movieResponse.body.movie.ratings).toBe(4);
    });
    
    test('should update movie rating when review is deleted', async () => {
      const review1 = await createTestReview(movie._id, user1._id, { rating: 8 });
      await createTestReview(movie._id, user2._id, { rating: 6 });
      
      await request(app)
        .delete(`/api/v1/reviews/${review1._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .expect(200);
      
      const movieResponse = await request(app)
        .get(`/api/v1/movies/${movie._id}`)
        .expect(200);
      
      expect(movieResponse.body.movie.ratings).toBe(6);
      expect(movieResponse.body.reviewCount).toBe(1);
    });

    test('should set rating to 0 when all reviews are deleted', async () => {
      const review = await createTestReview(movie._id, user1._id, { rating: 8 });
      
      await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Cookie', `${AUTH_COOKIE}=${token1}`)
        .expect(200);
      
      const movieResponse = await request(app)
        .get(`/api/v1/movies/${movie._id}`)
        .expect(200);
      
      expect(movieResponse.body.movie.ratings).toBe(0);
      expect(movieResponse.body.reviewCount).toBe(0);
    });
  });
  
  describe('Race Condition Prevention', () => {
    test('should prevent duplicate reviews even under concurrent requests', async () => {
      const requests = [
        request(app)
          .post(`/api/v1/movies/${movie._id}/reviews`)
          .set('Cookie', `${AUTH_COOKIE}=${token1}`)
          .send({
            content: 'This is a detailed review first attempt.',
            rating: 8
          }),
        request(app)
          .post(`/api/v1/movies/${movie._id}/reviews`)
          .set('Cookie', `${AUTH_COOKIE}=${token1}`)
          .send({
            content: 'This is a detailed review second attempt.',
            rating: 7
          })
      ];
      
      const results = await Promise.allSettled(requests);
      
      const statuses = results
        .map(r => r.value ? r.value.status : r.reason?.status || r.reason)
        .filter(s => typeof s === 'number')
        .sort();
      
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);
      
      const reviews = await Review.find({ movieId: movie._id, userId: user1._id });
      expect(reviews.length).toBe(1);
    });
  });
});
