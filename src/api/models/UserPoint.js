const mongoose = require('mongoose');
const { createUserProgressTemplate } = require('./UserPointSchema');

// Define the user points schema
const userPointSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  progressData: {
    type: Object,
    default: createUserProgressTemplate,
  },
  lastSynced: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Method to initialize user points
userPointSchema.statics.initializeForUser = async function (userId) {
  try {
    // Check if user points already exist
    const existingPoints = await this.findOne({ userId });
    if (existingPoints) {
      return existingPoints; // User already has points initialized
    }
    // Create new user points with default template
    const newUserPoints = new this({
      userId,
      progressData: createUserProgressTemplate(),
    });
    // Save to database
    await newUserPoints.save();
    return newUserPoints;
  } catch (error) {
    console.error('Error initializing user points:', error);
    throw error;
  }
};

// Method to update points
userPointSchema.methods.updateProgress = async function (updatedProgressData) {
  try {
    // Use this approach for deep updates
    this.progressData = updatedProgressData;
    this.totalPoints = updatedProgressData.totalPoints;
    this.lastSynced = new Date();

    // Mark the field as modified to ensure Mongoose saves the changes
    this.markModified('progressData');

    await this.save();
    return this;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// Create the UserPoint model
const UserPoint = mongoose.model('UserPoint', userPointSchema);

// Export the model
module.exports = UserPoint;
