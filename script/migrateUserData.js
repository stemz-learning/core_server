const mongoose = require('mongoose');
const User = require('../src/api/models/userModel.js'); // Note the '../' to go up one directory

async function migrateUsers() {
  try {
    // Connect to your MongoDB with your actual connection string
    await mongoose.connect('mongodb+srv://stemzlearning:stemz123@stemz.ae0vefg.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Set default gradeLevel for all existing users who don't have it
    const updateResult = await User.updateMany(
      { gradeLevel: { $exists: false } }, // Find users without the gradeLevel field
      { $set: { gradeLevel: 1 } } // Set default to 1st grade
    );
    
    console.log(`Updated ${updateResult.modifiedCount} users with default grade level`);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

migrateUsers();