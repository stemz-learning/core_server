const express = require('express');
const mongoose = require('mongoose');
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

// Updated notification and assignment systems
router.use('/notifications', notificationRoutes);
router.use('/assignments', assignmentRoutes);

router.use('/responses', studentResponseRoutes);


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
      '/api/assignments'
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
