// RUN: node ./src/tests/testpoint.js
// A TEST FOR THE POINT SYSTEM

const mongoose = require('mongoose');
const User = require('../api/models/userModel');
const UserPoint = require('../api/models/userPointModel');

// Connect to a test database
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pointsystem_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to test database');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Clean up test database
async function clearDB() {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
    await UserPoint.deleteMany({});
    console.log('Test database cleared');
  }
}

// Helper function to log test headers
function logTestHeader(testName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${testName}`);
  console.log(`${'-'.repeat(80)}`);
}

// Test all functionality
async function runComprehensiveTests() {
  // Create test user for all tests
  logTestHeader('Creating test user');
  const user = new User({
    name: 'Test Student',
    email: 'student@test.example',
    password: 'securepassword123'
  });
  await user.save();
  console.log(`Test user created with ID: ${user._id}`);
  
  // Test 1: Initialize points
  logTestHeader('Initial points creation');
  const userPoints = await UserPoint.initializeForUser(user._id);
  console.log(`Points initialized successfully for user: ${user._id}`);
  console.log(`Total points: ${userPoints.totalPoints}`);
  console.log(`Number of courses: ${Object.keys(userPoints.progressData.courses).length}`);
  console.log('Initial course structure is correct:', 
    userPoints.progressData.courses.astronomy.title === 'Astronomy' &&
    userPoints.progressData.courses.astronomy.lessons.lesson1.title === 'The Solar System');
  
  // Test 2: Check default values
  logTestHeader('Verifying default values');
  const astronomyLesson1 = userPoints.progressData.courses.astronomy.lessons.lesson1;
  console.log('Default Course Points:', userPoints.progressData.courses.astronomy.coursePoints);
  console.log('Default Lesson Points:', astronomyLesson1.lessonPoints);
  console.log('Default Video Status:', astronomyLesson1.activities.video.completed);
  console.log('Default Video Points Earned:', astronomyLesson1.activities.video.earned);
  
  // Test 3: Update video progress (partial)
  logTestHeader('Updating video progress to 50%');
  let progressData = userPoints.progressData;
  progressData.courses.astronomy.lessons.lesson1.activities.video.percentWatched = 50;
  progressData.courses.astronomy.lessons.lesson1.activities.video.earned = 
    Math.round(progressData.courses.astronomy.lessons.lesson1.activities.video.points * 0.5);
  
  await userPoints.updateProgress(progressData);
  
  let updatedPoints = await UserPoint.findOne({ userId: user._id });
  const partialVideo = updatedPoints.progressData.courses.astronomy.lessons.lesson1.activities.video;
  console.log('50% Video Progress:', partialVideo);
  console.log('Earned points (should be ~3-4):', partialVideo.earned);
  
  // Test 4: Complete a video
  logTestHeader('Completing a video');
  progressData = updatedPoints.progressData;
  progressData.courses.astronomy.lessons.lesson1.activities.video.percentWatched = 100;
  progressData.courses.astronomy.lessons.lesson1.activities.video.completed = true;
  progressData.courses.astronomy.lessons.lesson1.activities.video.earned = 
    progressData.courses.astronomy.lessons.lesson1.activities.video.points;
  
  await updatedPoints.updateProgress(progressData);
  
  updatedPoints = await UserPoint.findOne({ userId: user._id });
  const completedVideo = updatedPoints.progressData.courses.astronomy.lessons.lesson1.activities.video;
  console.log('Completed Video Progress:', completedVideo);
  console.log('Video marked completed:', completedVideo.completed);
  console.log('Full points earned:', completedVideo.earned);
  
  // Test 5: Complete a worksheet
  logTestHeader('Completing a worksheet');
  progressData = updatedPoints.progressData;
  progressData.courses.astronomy.lessons.lesson1.activities.worksheet.completed = true;
  progressData.courses.astronomy.lessons.lesson1.activities.worksheet.earned = 
    progressData.courses.astronomy.lessons.lesson1.activities.worksheet.points;
  
  await updatedPoints.updateProgress(progressData);
  
  updatedPoints = await UserPoint.findOne({ userId: user._id });
  const completedWorksheet = updatedPoints.progressData.courses.astronomy.lessons.lesson1.activities.worksheet;
  console.log('Completed Worksheet:', completedWorksheet);
  
  // Test 6: Complete a lesson (all activities)
  logTestHeader('Completing a full lesson');
  progressData = updatedPoints.progressData;
  progressData.courses.astronomy.lessons.lesson1.completed = true;
  progressData.courses.astronomy.lessons.lesson1.lessonPoints = 
    completedVideo.earned + completedWorksheet.earned + 10; // +10 for full lesson completion
  
  await updatedPoints.updateProgress(progressData);
  
  updatedPoints = await UserPoint.findOne({ userId: user._id });
  console.log('Lesson status:', updatedPoints.progressData.courses.astronomy.lessons.lesson1.completed);
  console.log('Lesson points:', updatedPoints.progressData.courses.astronomy.lessons.lesson1.lessonPoints);
  
  // Test 7: Partial quiz completion
  logTestHeader('Partial quiz completion');
  progressData = updatedPoints.progressData;
  const quiz = progressData.courses.astronomy.lessons.lesson4.activities.quiz;
  quiz.completed = true;
  quiz.correctAnswers = 10; // 10 out of 14 correct
  quiz.questionsCount = 14;
  quiz.percentCorrect = Math.round((quiz.correctAnswers / quiz.questionsCount) * 100);
  quiz.earned = Math.round((quiz.points * quiz.percentCorrect) / 100);
  
  await updatedPoints.updateProgress(progressData);
  
  updatedPoints = await UserPoint.findOne({ userId: user._id });
  console.log('Quiz Completion Status:', updatedPoints.progressData.courses.astronomy.lessons.lesson4.activities.quiz);
  
  // Test 8: Perfect quiz completion
  logTestHeader('Perfect quiz completion');
  progressData = updatedPoints.progressData;
  const perfectQuiz = progressData.courses.astronomy.lessons.lesson4.activities.quiz;
  perfectQuiz.completed = true;
  perfectQuiz.correctAnswers = 14; // All correct
  perfectQuiz.questionsCount = 14;
  perfectQuiz.percentCorrect = 100;
  perfectQuiz.earned = perfectQuiz.points + perfectQuiz.extraPoints; // Base + bonus points
  
  await updatedPoints.updateProgress(progressData);
  
  updatedPoints = await UserPoint.findOne({ userId: user._id });
  console.log('Perfect Quiz Status:', updatedPoints.progressData.courses.astronomy.lessons.lesson4.activities.quiz);
  console.log('Earned with bonus:', updatedPoints.progressData.courses.astronomy.lessons.lesson4.activities.quiz.earned);
  
  // Test 9: Test with another course (Chemistry)
  logTestHeader('Testing multiple courses');
  progressData = updatedPoints.progressData;
  progressData.courses.chemistry.lessons.lesson1.activities.video.percentWatched = 100;
  progressData.courses.chemistry.lessons.lesson1.activities.video.completed = true;
  progressData.courses.chemistry.lessons.lesson1.activities.video.earned = 7;
  
  await updatedPoints.updateProgress(progressData);
  
  updatedPoints = await UserPoint.findOne({ userId: user._id });
  console.log('Chemistry Video Status:', updatedPoints.progressData.courses.chemistry.lessons.lesson1.activities.video);
  
  // Test 10: Calculate total points across courses
  logTestHeader('Calculating total points');
  progressData = updatedPoints.progressData;
  
  // Sum up all earned points
  let totalPoints = 0;
  Object.keys(progressData.courses).forEach(courseId => {
    const course = progressData.courses[courseId];
    Object.keys(course.lessons).forEach(lessonId => {
      const lesson = course.lessons[lessonId];
      Object.keys(lesson.activities).forEach(activityId => {
        totalPoints += lesson.activities[activityId].earned || 0;
      });
      // Add lesson completion points if applicable
      if (lesson.completed) {
        totalPoints += 10;
      }
    });
  });
  
  progressData.totalPoints = totalPoints;
  
  await updatedPoints.updateProgress(progressData);
  
  updatedPoints = await UserPoint.findOne({ userId: user._id });
  console.log('Total Points Calculated:', updatedPoints.progressData.totalPoints);
  console.log('Expected Total Points:', totalPoints);
  
  // Test 11: Test finding user points
  logTestHeader('Finding user points');
  const foundPoints = await UserPoint.findOne({ userId: user._id });
  console.log('Found user points:', foundPoints !== null);
  console.log('Correct user ID:', foundPoints.userId.toString() === user._id.toString());
  
  // Test 12: Test multiple users
  logTestHeader('Test with multiple users');
  const secondUser = new User({
    name: 'Another Student',
    email: 'another@test.example',
    password: 'anotherpassword123'
  });
  await secondUser.save();
  
  const secondUserPoints = await UserPoint.initializeForUser(secondUser._id);
  console.log('Second user points initialized:', secondUserPoints !== null);
  
  // Modify second user's progress
  const secondProgressData = secondUserPoints.progressData;
  secondProgressData.courses.zoology.lessons.lesson1.activities.video.percentWatched = 100;
  secondProgressData.courses.zoology.lessons.lesson1.activities.video.completed = true;
  secondProgressData.courses.zoology.lessons.lesson1.activities.video.earned = 7;
  
  await secondUserPoints.updateProgress(secondProgressData);
  
  // Verify first user's data is unchanged
  const firstUserAgain = await UserPoint.findOne({ userId: user._id });
  console.log('First user has astronomy progress:', 
    firstUserAgain.progressData.courses.astronomy.lessons.lesson1.activities.video.completed);
  console.log('First user has no zoology progress:', 
    !firstUserAgain.progressData.courses.zoology.lessons.lesson1.activities.video.completed);
  
  // Verify second user's data
  const secondUserAgain = await UserPoint.findOne({ userId: secondUser._id });
  console.log('Second user has zoology progress:', 
    secondUserAgain.progressData.courses.zoology.lessons.lesson1.activities.video.completed);
  
  console.log('\nAll tests completed successfully!');
}

// Run all tests
async function runTests() {
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to database. Aborting tests.');
    process.exit(1);
  }
  
  try {
    await clearDB();
    await runComprehensiveTests();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

runTests();