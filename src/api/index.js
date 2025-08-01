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
const app = express();

app.use(express.json());

connectDB();

app.use('/users', userRoutes);
app.use('/classrooms', classroomRoutes);
app.use('/worksheets', worksheetRoutes);
app.use('/auth', auth);
app.use('/points', userPointRoutes);
app.use('/course', courseRoutes);
app.use('/grade', gradeRoutes);
app.use('/bpqquestions', bpqQuestionRoutes);
app.use('/quizquestions', quizQuestionRoutes);
app.use('/studentresponses', studentResponseRoutes);
app.use('/teachers', teachers);
app.use('/portalCourses', portalCourseRoutes);

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
