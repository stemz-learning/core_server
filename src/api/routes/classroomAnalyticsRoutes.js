const express = require('express');
const router = express.Router();
const { getCourseAnalytics, getCourseRecentActivity } = require('../controllers/classroomAnalyticsController');

// comprehensive analytics for a course (completion rates, grades, etc.)
router.get('/classrooms/:classroomId/courses/:courseId/analytics', getClassroomCourseAnalytics)

// recent activity for the Active Users component
router.get('/classrooms/:classroomId/courses/:courseId/recent-activity', getClassroomCourseRecentActivity);

module.exports = router;