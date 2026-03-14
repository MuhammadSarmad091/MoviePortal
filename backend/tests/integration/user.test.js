/**
 * User Authentication Integration Tests
 * Tests user registration, login, and profile retrieval
 */

const {
  connectTestDB,
  disconnectTestDB,
  clearTestDatabase,
  getTestToken,
  getExpiredToken,
  getInvalidToken,
  createTestUser,
  testFixtures
} = require('../setup');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const User = require('../../src/models/User');

describe('User Authentication Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });
  
  afterAll(async () => {
    await disconnectTestDB();
  });
  
  beforeEach(async () => {
    await clearTestDatabase();
  });
  
  describe('POST /api/v1/users/register', () => {
    test('should fail with duplicate email', async () => {
      const userData = testFixtures.users[0];
      
      // Create first user
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          username: 'different_username',
          email: userData.email,
          password: 'Password123!',
          displayName: 'Different User'
        })
        .expect(400);
      
      expect(response.body.message).toContain('Email already registered');
    });
    
    test('should fail with duplicate username', async () => {
      const userData = testFixtures.users[0];
      
      // Create first user
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
      // Try to register with same username
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          username: userData.username,
          email: 'different@example.com',
          password: 'Password123!',
          displayName: 'Different User'
        })
        .expect(400);
      
      expect(response.body.message).toContain('Username already taken');
    });
  });
  
  describe('POST /api/v1/users/login', () => {
    test('should login user with correct credentials', async () => {
      const userData = testFixtures.users[0];
      
      // Register user first
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
      // Login
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('token');
      
      // Verify token is valid JWT
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(response.body.data.userId);
    });
    
    test('should fail login with incorrect password', async () => {
      const userData = testFixtures.users[0];
      
      // Register user
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
      // Try login with wrong password
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);
      
      expect(response.body.message).toContain('Invalid email or password');
    });
    
    test('should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        })
        .expect(401);
      
      expect(response.body.message).toContain('Invalid email or password');
    });
  });
  
  describe('JWT Token Validation', () => {
    test('should reject request with expired token', async () => {
      const user = await createTestUser();
      const expiredToken = getExpiredToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
      
      expect(response.body.message).toContain('Invalid or expired token');
    });
    
    test('should reject request with invalid token', async () => {
      const invalidToken = getInvalidToken();
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
      
      expect(response.body.message).toContain('Invalid or expired token');
    });
    
    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);
      
      expect(response.body.message).toContain('No token provided');
    });
    
    test('should accept valid token', async () => {
      const user = await createTestUser();
      const validToken = getTestToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
      
      expect(response.body.data.email).toBe(user.email);
    });
  });
  
  describe('GET /api/v1/users/profile', () => {
    test('should return user profile with valid token', async () => {
      const user = await createTestUser();
      const token = getTestToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data.username).toBe(user.username);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should include createdAt in profile', async () => {
      const user = await createTestUser();
      const token = getTestToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data).toHaveProperty('createdAt');
    });
  });

  describe('GET /api/v1/users/me', () => {
    test('should return current user profile via /me endpoint', async () => {
      const user = await createTestUser();
      const token = getTestToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data.username).toBe(user.username);
      expect(response.body.data.email).toBe(user.email);
    });
  });
});
