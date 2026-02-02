const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const connectDB = require('./mongodb');

const userRoutes = require('./routes/userRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const physicalClassroomRoutes = require('./routes/physicalClassroomRoutes');
const worksheetRoutes = require('./routes/worksheetRoutes');
const auth = require('./routes/auth');
const userPointRoutes = require('./routes/userPointRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentResponseRoutes = require('./routes/studentResponseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const bpqQuestionRoutes = require('./routes/bpqQuestionRoutes');
const quizQuestionRoutes = require('./routes/quizQuestionRoutes');
const teachers = require('./routes/teacherRoutes');
const portalCourseRoutes = require('./routes/portalCourseRoutes');
const progressRoutes = require('./routes/progressRoutes');
const classroomAnalyticsRoutes = require('./routes/classroomAnalyticsRoutes');
const studyGroupRoutes = require('./routes/studyGroupRoutes');
const groupMessageRoutes = require('./routes/groupMessageRoutes');
const directMessageRoutes = require('./routes/directMessageRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

// Register all routes
router.use('/users', userRoutes);

router.use('/classrooms', classroomRoutes); // Online course system
router.use('/physical-classrooms', physicalClassroomRoutes); // Real-world classroom system， teacher portal classrooms
router.use('/courses', courseRoutes); // Self-paced courses, worksheets, and quizzs
router.use('/worksheets', worksheetRoutes);
router.use('/auth', auth);
router.use('/points', userPointRoutes);
router.use('/grades', gradeRoutes);
router.use('/bpqquestions', bpqQuestionRoutes);
router.use('/quizquestions', quizQuestionRoutes);
router.use('/studentresponses', studentResponseRoutes);
router.use('/teachers', teachers);
router.use('/portal-courses', portalCourseRoutes);

// Updated notification and assignment systems
router.use('/notifications', notificationRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/progress', progressRoutes);
router.use('/studygroups', studyGroupRoutes);
router.use('/group-messages', groupMessageRoutes);
router.use('/messages', directMessageRoutes);
router.use('/chatbot', chatbotRoutes);

router.use('/analytics', classroomAnalyticsRoutes);

// 404 Not Found middleware
router.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    availableRoutes: [
      '/api/users',
      '/api/classrooms',
      '/api/physical-classrooms',
      '/api/courses',
      '/api/worksheets',
      '/api/auth',
      '/api/points',
      '/api/grades',
      '/api/bpqquestions',
      '/api/quizquestions',
      '/api/student-responses',
      '/api/teachers',
      '/api/portal-courses',
      '/api/notifications',
      '/api/assignments',
      '/api/progress',
      '/api/studygroups',
      '/api/group-messages',
      '/api/messages',
      '/api/chatbot',
      '/api/analytics',
    ],
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

module.exports = router;
