const mongoose = require('mongoose');
const Classroom = require('../src/api/models/classroomModel.js');

async function migrateClassrooms() {
  try {
    // Connect to your MongoDB with your actual connection string
    await mongoose.connect('mongodb+srv://XXXX', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Set default values for all existing documents
    const updateResult = await Classroom.updateMany(
      { schedule: { $exists: false } }, // Find documents without the schedule field
      { $set: { schedule: '', recommendedGradeLevel: '' } } // Set empty default values
    );
    
    console.log(`Updated ${updateResult.modifiedCount} documents`);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

migrateClassrooms();