const express = require('express');
const router = express.Router();
const { getCourseAnalytics, getCourseRecentActivity } = require('../controllers/classroomAnalyticsController');

// comprehensive analytics for a course (completion rates, grades, etc.)
router.get('/:courseId/analytics', getCourseAnalytics);

// recent activity for the Active Users component
router.get('/:courseId/recent-activity', getCourseRecentActivity);

module.exports = router;