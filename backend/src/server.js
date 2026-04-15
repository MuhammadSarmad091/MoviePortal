// Entry point for the backend server
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Load environment variables from the appropriate .env file
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, `../../${envFile}`) });

const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { config, validateEnvironment } = require('./config/environment');

// Validate environment before creating app
try {
  validateEnvironment();
} catch (error) {
  console.error('⚠️  Environment Validation Error:', error.message);
  process.exit(1);
}

const app = express();

// CORS configuration with allowlist (from centralized config)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
};

// Middleware - Security & Performance
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors(corsOptions)); // CORS with allowlist
app.use(cookieParser());
app.use(express.json({ limit: config.request.jsonLimit })); // Body size limit (DoS protection)
app.use(express.urlencoded({ extended: true, limit: config.request.urlencodedLimit })); // URL-encoded limit

// API Routes with versioning (v1)
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', environment: config.server.nodeEnv });
});

// Alias for backward compatibility (deprecated)
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(config.server.port, () => {
      console.log(`🚀 Backend server is running on port ${config.server.port} (${config.server.nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Function to initialize app (connect to DB without listening)
const initializeApp = async () => {
  await connectDB();
};

// Only start server if not in test mode
if (config.server.nodeEnv !== 'test') {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
module.exports.initializeApp = initializeApp;
