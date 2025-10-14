const UserPoint = require('../models/UserPoint');
const User = require('../models/User');

// Get user's points
const getUserPoints = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Find user points
    let userPoints = await UserPoint.findOne({ userId });

    // If points don't exist, initialize them
    if (!userPoints) {
      userPoints = await UserPoint.initializeForUser(userId);
    }

    return res.status(200).json(userPoints.progressData);
  } catch (error) {
    console.error('Error fetching user points:', error);
    return res.status(500).json({ message: 'Failed to retrieve user points', error: error.message });
  }
};

// Update user's entire points data
const updateUserPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const progressData = req.body;

    // Find user points
    let userPoints = await UserPoint.findOne({ userId });

    // If points don't exist, initialize them
    if (!userPoints) {
      userPoints = await UserPoint.initializeForUser(userId);
    }

    // Update progress
    await userPoints.updateProgress(progressData);

    return res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      points: userPoints.totalPoints,
    });
  } catch (error) {
    console.error('Error updating user points:', error);
    return res.status(500).json({ message: 'Failed to update user points', error: error.message });
  }
};

// Update specific activity progress
const updateActivityProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      courseId, lessonId, activityType, progressData,
    } = req.body;

    if (!courseId || !lessonId || !activityType || !progressData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find user points
    let userPoints = await UserPoint.findOne({ userId });

    if (!userPoints) {
      userPoints = await UserPoint.initializeForUser(userId);
    }

    // Get current progress data
    const currentProgressData = userPoints.progressData;

    // Ensure the progress data has the expected structure
    if (!currentProgressData || !currentProgressData.courses) {
      return res.status(404).json({ message: 'User progress data not properly initialized' });
    }

    // Update the specific activity
    if (!currentProgressData.courses[courseId]
        || !currentProgressData.courses[courseId].lessons[lessonId]
        || !currentProgressData.courses[courseId].lessons[lessonId].activities[activityType]) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Update activity with new progress data
    Object.assign(
      currentProgressData.courses[courseId].lessons[lessonId].activities[activityType],
      progressData,
    );

    // Save the updated progress
    await userPoints.updateProgress(currentProgressData);

    return res.status(200).json({
      success: true,
      message: 'Activity progress updated',
      activity: currentProgressData.courses[courseId].lessons[lessonId].activities[activityType],
    });
  } catch (error) {
    console.error('Error updating activity progress:', error);
    return res.status(500).json({ message: 'Failed to update activity progress', error: error.message });
  }
};

// Reset user points (admin only)
const resetUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete existing points
    await UserPoint.deleteOne({ userId });

    // Reinitialize
    const newPoints = await UserPoint.initializeForUser(userId);

    return res.status(200).json({
      success: true,
      message: 'User points reset successfully',
      points: newPoints.progressData,
    });
  } catch (error) {
    console.error('Error resetting user points:', error);
    return res.status(500).json({ message: 'Failed to reset user points', error: error.message });
  }
};

// Get total points for a user
const getUserTotalPoints = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const userPoints = await UserPoint.findOne({ userId });

    if (!userPoints) {
      return res.status(404).json({ message: 'Points not found for this user' });
    }

    return res.status(200).json({
      userId,
      totalPoints: userPoints.totalPoints,
    });
  } catch (error) {
    console.error('Error fetching user total points:', error);
    return res.status(500).json({ message: 'Failed to retrieve total points', error: error.message });
  }
};

module.exports = {
  getUserPoints,
  updateUserPoints,
  updateActivityProgress,
  resetUserPoints,
  getUserTotalPoints,
};
