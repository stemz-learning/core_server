const express = require('express');
const router = express.Router();

const userRoutes = require('./routes/userRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const worksheetRoutes = require('./routes/worksheetRoutes');
const auth = require('./routes/auth');
const userPointRoutes = require('./routes/userPointRoutes');


router.get('/', (req, res) => {
  res.json({ message: 'API - 👋🌎🌍🌏' });
});

// Register user and classroom routes
router.use('/users', userRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/worksheets', worksheetRoutes);
router.use('/auth', auth);
router.use('/points', userPointRoutes);

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
