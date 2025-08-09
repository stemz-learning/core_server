const express = require('express');
const NotificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// Student routes
router.get('/my-notifications', authenticateToken, NotificationController.getUserNotifications);
router.get('/summary', authenticateToken, NotificationController.getNotificationSummary);
router.post('/read/:notificationId', authenticateToken, NotificationController.markAsRead);
router.post('/dismiss/:notificationId', authenticateToken, NotificationController.dismissNotification);
router.post('/clear-all', authenticateToken, NotificationController.clearAllNotifications);


// Teacher routes
router.get('/classroom/:classroomId', authenticateToken, NotificationController.getClassroomNotifications);
router.post('/announcement', authenticateToken, NotificationController.createAnnouncement);
router.post('/assignment', authenticateToken, NotificationController.createAssignmentNotification);// ADD this line if it doesn't exist:
router.get('/teacher-notifications', authenticateToken, NotificationController.getTeacherNotifications);
router.get('/all-teacher-notifications', NotificationController.getAllTeacherNotifications);


// System routes (for quiz failures, called by system)
router.post('/quiz-failure', authenticateToken, NotificationController.createQuizFailureNotification);
router.post('/email', NotificationController.sendEmailNotification);
router.get('/legacy', NotificationController.getAllNotifications);

module.exports = router;