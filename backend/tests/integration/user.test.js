/**
 * User Authentication Integration Tests
 * Tests user registration, login, and profile retrieval.
 * All authenticated requests use httpOnly cookies — no Bearer tokens.
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
const app = require('../../src/server');

const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME || 'auth_token';

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
      
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
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
      
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
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
    test('should login user and set httpOnly auth cookie', async () => {
      const userData = testFixtures.users[0];
      
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('username');

      // Token must NOT be in the response body
      expect(response.body.data).not.toHaveProperty('token');

      // Token must be in an httpOnly cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const authCookie = cookies.find(c => c.startsWith(`${AUTH_COOKIE}=`));
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
    });
    
    test('should fail login with incorrect password', async () => {
      const userData = testFixtures.users[0];
      
      await request(app)
        .post('/api/v1/users/register')
        .send(userData);
      
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
  
  describe('Cookie Token Validation', () => {
    test('should reject request with expired token cookie', async () => {
      const user = await createTestUser();
      const expiredToken = getExpiredToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', `${AUTH_COOKIE}=${expiredToken}`)
        .expect(401);
      
      expect(response.body.message).toContain('Invalid or expired token');
    });
    
    test('should reject request with invalid token cookie', async () => {
      const invalidToken = getInvalidToken();
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', `${AUTH_COOKIE}=${invalidToken}`)
        .expect(401);
      
      expect(response.body.message).toContain('Invalid or expired token');
    });
    
    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);
      
      expect(response.body.message).toContain('No token provided');
    });
    
    test('should accept valid token cookie', async () => {
      const user = await createTestUser();
      const validToken = getTestToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', `${AUTH_COOKIE}=${validToken}`)
        .expect(200);
      
      expect(response.body.data.email).toBe(user.email);
    });

    test('should reject Bearer token in Authorization header', async () => {
      const user = await createTestUser();
      const validToken = getTestToken(user._id.toString());

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });
  });
  
  describe('GET /api/v1/users/profile', () => {
    test('should return user profile with valid cookie', async () => {
      const user = await createTestUser();
      const token = getTestToken(user._id.toString());
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Cookie', `${AUTH_COOKIE}=${token}`)
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
        .set('Cookie', `${AUTH_COOKIE}=${token}`)
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
        .set('Cookie', `${AUTH_COOKIE}=${token}`)
        .expect(200);
      
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.username).toBe(user.username);
      expect(response.body.data.email).toBe(user.email);
    });
  });
});
