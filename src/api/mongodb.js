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
    // Change the following line to connect to other Databases on mongodb.
    const db = await mongoose.connect(process.env.MONGODB_URI + process.env.TEACHER_PLATFORM_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Let the error bubble up
  }
};

module.exports = connectDB;
