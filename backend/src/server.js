// Entry point for the backend server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Startup environment validation
const validateEnvironment = () => {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'BACKEND_PORT'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate environment before creating app
try {
  validateEnvironment();
} catch (error) {
  console.error('⚠️  Environment Validation Error:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// CORS configuration with allowlist
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:80', 'http://localhost'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware - Security & Performance
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors(corsOptions)); // CORS with allowlist
app.use(express.json({ limit: '10kb' })); // Body size limit (DoS protection)
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // URL-encoded limit

// Routes
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
