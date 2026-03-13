const mongoose = require('mongoose');
const { config } = require('./environment');

const connectDB = async () => {
  try {
    const mongoUri = config.database.mongoUri;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
