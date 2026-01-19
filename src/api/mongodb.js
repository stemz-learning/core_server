const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Connect to MongoDB
let isConnected; // Track the connection state

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    if (!process.env.TEACHER_PLATFORM_DB) {
      console.warn('⚠️  WARNING: TEACHER_PLATFORM_DB is not set. Will connect to default "test" database');
    }

    const dbName = process.env.TEACHER_PLATFORM_DB || 'test';
    const connectionString = process.env.MONGODB_URI + dbName;
    
    console.log(`🔌 Connecting to database: "${dbName}"`);
    
    // Change the following line to connect to other Databases on mongodb.
    const db = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = db.connections[0].readyState;
    console.log(`✅ MongoDB connected successfully to: "${mongoose.connection.name}"`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error; // Let the error bubble up
  }
};

module.exports = connectDB;
