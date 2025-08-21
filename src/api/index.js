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
router.use('/course', courseRoutes);
router.use('/grade', gradeRoutes);
router.use('/bpqquestions', bpqQuestionRoutes);
router.use('/quizquestions', quizQuestionRoutes);
router.use('/studentresponses', studentResponseRoutes);
router.use('/teachers', teachers);
router.use('/portalCourses', portalCourseRoutes);

// Updated notification and assignment systems
router.use('/notifications', notificationRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/progress', progressRoutes);

router.use('/responses', studentResponseRoutes);
router.use('/analytics', classroomAnalyticsRoutes);
router.use('/chatbot', chatbotRoutes);


// 404 Not Found middleware
router.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: [
      '/api/docs',
      '/api/users',
      '/api/classrooms',
      '/api/physical-classrooms',
      '/api/notifications',
      '/api/assignments',
      '/api/courses',
      '/api/worksheets',
      '/api/auth',  
      '/api/points',
      '/api/grades',
      '/api/bpqquestions',
      '/api/quizquestions',
      '/api/studentresponses',
      '/api/teachers',
      '/api/portalCourses',
      '/api/progress',
      '/api/responses',
      '/api/analytics',
      '/api/chatbot'
    ]
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = router;