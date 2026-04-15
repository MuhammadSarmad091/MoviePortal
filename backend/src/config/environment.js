/**
 * Centralized Environment Configuration
 * All environment variables and their defaults are defined here
 * Single source of truth for configuration
 */

const config = {
  // Database Configuration
  database: {
    mongoUri: process.env.MONGODB_URI || '',
    name: 'movieportal'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: '7d',
    algorithm: 'HS256'
  },
  authCookie: {
    name: process.env.AUTH_COOKIE_NAME || 'auth_token',
    maxAgeMs: parseInt(process.env.AUTH_COOKIE_MAX_AGE_MS, 10) || 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.AUTH_COOKIE_SAME_SITE || 'lax',
    secure: process.env.AUTH_COOKIE_SECURE === 'true'
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.BACKEND_PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
    isProduction: (process.env.NODE_ENV || 'development') === 'production'
  },

  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://localhost:80', 'http://localhost'],
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
  }
};

/**
 * Validate required environment variables at startup
 * @throws {Error} If required environment variables are missing
 */
const validateEnvironment = () => {
  const requiredVars = {
    MONGODB_URI: config.database.mongoUri,
    JWT_SECRET: config.jwt.secret,
    BACKEND_PORT: config.server.port
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return true;
};

module.exports = {
  config,
  validateEnvironment
};
