/**
 * User Authentication Integration Tests
 * Tests user registration, login, and JWT token validation
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
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
    test('should register new user with valid credentials', async () => {
      const userData = testFixtures.users[0];
      
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('token');
      
      // Verify user created in database
      const user = await User.findById(response.body.data.userId);
      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
    });
    
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
      
      expect(response.body.message).toContain('Email already exists');
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
      
      expect(response.body.message).toContain('Username already exists');
    });
    
    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Password123!',
          displayName: 'Test User'
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
    });
    
    test('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123', // Too short
          displayName: 'Test User'
        })
        .expect(400);
      
      expect(response.body.message).toBeDefined();
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
      
      expect(response.body.message).toContain('Token expired');
    });
    
    test('should reject request with invalid token', async () => {
      const invalidToken = getInvalidToken();
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
      
      expect(response.body.message).toContain('Invalid token');
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
  });
});
