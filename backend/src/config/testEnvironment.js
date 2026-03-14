/**
 * Test Environment Configuration
 * Centralized environment variables for testing
 * Single source of truth for all test configuration
 */

const testConfig = {
  // Database Configuration for Testing
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://testuser:testpass@localhost:27017/test_db?authSource=admin',
    name: 'test_db'
  },

  // JWT Configuration for Testing
  jwt: {
    secret: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only-not-for-production',
    expiresIn: '7d',
    algorithm: 'HS256',
    expiry: process.env.JWT_EXPIRY || '7d'
  },

  // Server Configuration for Testing
  server: {
    port: parseInt(process.env.BACKEND_PORT, 10) || 4000,
    nodeEnv: 'test',
    isDevelopment: false,
    isProduction: false,
    isTest: true
  },

  // CORS Configuration for Testing (allow all for tests)
  cors: {
    allowedOrigins: ['http://localhost:3000', 'http://localhost:80', 'http://localhost', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Pagination Configuration
  pagination: {
    maxPage: 1000,
    maxLimit: 100,
    defaultLimit: 10
  },

  // Request Configuration
  request: {
    jsonLimit: '10kb',
    urlencodedLimit: '10kb'
  },

  // Logging Configuration for Testing
  logging: {
    level: process.env.LOG_LEVEL || 'error',
    enableDetailedErrors: false
  },

  // Feature Flags for Testing
  features: {
    enableSeeding: process.env.ENABLE_SEEDING === 'true',
    enableMocking: true
  }
};

/**
 * Validate required test environment variables
 * @throws {Error} If required environment variables are missing
 */
const validateTestEnvironment = () => {
  const requiredVars = {
    MONGODB_URI: testConfig.database.mongoUri,
    JWT_SECRET: testConfig.jwt.secret
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required test environment variables: ${missingVars.join(', ')}`);
  }

  return true;
};

module.exports = {
  testConfig,
  validateTestEnvironment
};
