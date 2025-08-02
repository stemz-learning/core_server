const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./mongodb');

const userRoutes = require('./routes/userRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const worksheetRoutes = require('./routes/worksheetRoutes');
const auth = require('./routes/auth');
const userPointRoutes = require('./routes/userPointRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentResponseRoutes = require('./routes/studentResponseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const bpqQuestionRoutes = require('./routes/bpqQuestionRoutes');
const quizQuestionRoutes = require('./routes/quizQuestionRoutes');
const teachers = require('./routes/teacherRoutes');
const portalCourseRoutes = require('./routes/portalCourseRoutes');

router.get('/', (req, res) => {
  res.json({ message: 'API - 👋🌎🌍🌏' });
});


router.use('/users', userRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/worksheets', worksheetRoutes);
router.use('/auth', auth);
router.use('/points', userPointRoutes);
router.use('/course', courseRoutes);
router.use('/grade', gradeRoutes);
router.use('/bpqquestions', bpqQuestionRoutes);
router.use('/quizquestions', quizQuestionRoutes);
router.use('/studentresponses', studentResponseRoutes);
router.use('/teachers', teachers);
router.use('/portalCourses', portalCourseRoutes);


// 404 Not Found middleware
router.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = router;