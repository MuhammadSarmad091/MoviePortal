/**
 * Movie CRUD Integration Tests
 * Tests movie creation, reading, updating, deleting, and pagination
 */

const {
  connectTestDB,
  disconnectTestDB,
  clearTestDatabase,
  getTestToken,
  createTestUser,
  createTestMovies,
  testFixtures
} = require('../setup');

const request = require('supertest');
const app = require('../../src/server');
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
          // Missing other required fields like description, releaseDate, etc.
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });

    test('should fail with duplicate title', async () => {
      const movieData = testFixtures.movies[0];
      
      // Create first movie
      await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${token}`)
        .send(movieData)
        .expect(201);
      
      // Try to create another with same title
      const response = await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${token}`)
        .send(movieData)
        .expect(400);
      
      expect(response.body.message).toContain('title already exists');
    });
  });
  
  describe('GET /api/v1/movies', () => {
    test('should get all movies with pagination', async () => {
      await createTestMovies(user._id, 3);
      
      const response = await request(app)
        .get('/api/v1/movies?page=1&limit=10')
        .expect(200);
      
      expect(response.body.movies).toHaveLength(3);
      expect(response.body.pagination.totalMovies).toBe(3);
      expect(response.body.pagination.currentPage).toBe(1);
    });
    
    test('should enforce pagination limit cap (max 100)', async () => {
      await createTestMovies(user._id, 3);
      
      const response = await request(app)
        .get('/api/v1/movies?page=1&limit=100000')
        .expect(200);
      
      // Should cap limit to 100
      expect(response.body.pagination.moviesPerPage).toBeLessThanOrEqual(100);
    });
  });
  
  describe('GET /api/v1/movies/:id', () => {
    test('should get single movie by id', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      const response = await request(app)
        .get(`/api/v1/movies/${movieId}`)
        .expect(200);
      
      expect(response.body.movie._id.toString()).toBe(movieId.toString());
      expect(response.body.movie.title).toBe(movies[0].title);
      expect(response.body).toHaveProperty('reviewCount');
    });
    
    test('should return 404 for non-existent movie', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/movies/${fakeId}`)
        .expect(404);
      
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('PUT /api/v1/movies/:id', () => {
    test('should update movie with valid data', async () => {
      const movies = await createTestMovies(user._id, 1);
      const movieId = movies[0]._id;
      
      const updatedData = {
        title: 'Updated Movie Title',
        description: 'Updated description',
        releaseDate: new Date('2024-01-01'),
        posterUrl: 'https://example.com/updated-poster.jpg',
        trailerUrl: 'https://example.com/updated-trailer.mp4'
      };
      
      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);
      
      expect(response.body.movie.title).toBe(updatedData.title);
      expect(response.body.movie.description).toBe(updatedData.description);
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
        .send({ 
          title: 'Hacked Title',
          description: 'Hacked description',
          releaseDate: new Date(),
          posterUrl: 'https://example.com/poster.jpg',
          trailerUrl: 'https://example.com/trailer.mp4'
        })
        .expect(403);
      
      expect(response.body.message).toContain('not authorized');
    });

    test('should prevent duplicate title on update', async () => {
      const movies = await createTestMovies(user._id, 2);
      const movieId = movies[0]._id;
      
      // Try to update first movie with second movie's title
      const response = await request(app)
        .put(`/api/v1/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          title: movies[1].title,
          description: movies[0].description,
          releaseDate: movies[0].releaseDate,
          posterUrl: movies[0].posterUrl,
          trailerUrl: movies[0].trailerUrl
        })
        .expect(400);
      
      expect(response.body.message).toContain('title already exists');
    });
  });
  
  describe('GET /api/v1/movies/search', () => {
    test('should search movies by title', async () => {
      await createTestMovies(user._id, 3);
      
      const response = await request(app)
        .get('/api/v1/movies/search?title=Test%20Movie%201')
        .expect(200);
      
      expect(response.body.movies.length).toBeGreaterThan(0);
      expect(response.body.movies[0].title).toContain('Test Movie 1');
    });

    test('should require title search parameter', async () => {
      const response = await request(app)
        .get('/api/v1/movies/search')
        .expect(400);
      
      expect(response.body.message).toContain('Title search parameter is required');
    });

    test('should perform case-insensitive search', async () => {
      await createTestMovies(user._id, 1);
      
      const response = await request(app)
        .get('/api/v1/movies/search?title=test%20movie')
        .expect(200);
      
      expect(response.body.movies.length).toBeGreaterThan(0);
    });
  });
});
