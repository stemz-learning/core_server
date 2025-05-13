//CONNECT TO A TEST LOCAL DB. TESTING PURPOSE
const mongoose = require('mongoose');

// Connection string - change based on your setup method
const MONGODB_URI = 'mongodb://localhost:27017/pointsystem_test';
// If using Atlas: 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pointsystem_test'
// If using Docker: 'mongodb://localhost:27017/pointsystem_test'

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

module.exports = { connectDB };