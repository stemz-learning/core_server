const express = require('express');
const NotificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// Student routes
// router.get('/my-notifications', authenticateToken, NotificationController.getUserNotifications);
// router.get('/summary', authenticateToken, NotificationController.getNotificationSummary);
// router.post('/read/:notificationId', authenticateToken, NotificationController.markAsRead);
// router.post('/dismiss/:notificationId', authenticateToken, NotificationController.dismissNotification);
// router.post('/clear-all', authenticateToken, NotificationController.clearAllNotifications);

router.get('/my-notifications', NotificationController.getUserNotifications);
router.get('/summary', NotificationController.getNotificationSummary);
router.post('/read/:notificationId', NotificationController.markAsRead);
router.post('/dismiss/:notificationId', NotificationController.dismissNotification);
router.post('/clear-all', NotificationController.clearAllNotifications);

// Teacher routes
// router.get('/classroom/:classroomId', authenticateToken, NotificationController.getClassroomNotifications);
// router.post('/announcement', authenticateToken, NotificationController.createAnnouncement);
// router.post('/assignment', authenticateToken, NotificationController.createAssignmentNotification);// ADD this line if it doesn't exist:
// router.get('/teacher-notifications', authenticateToken, NotificationController.getTeacherNotifications);

router.get('/classroom/:classroomId', NotificationController.getClassroomNotifications);
router.post('/announcement', NotificationController.createAnnouncement);
router.post('/assignment', NotificationController.createAssignmentNotification);// ADD this line if it doesn't exist:
router.get('/teacher-notifications', NotificationController.getTeacherNotifications);
router.get('/all-teacher-notifications', NotificationController.getAllTeacherNotifications);


// System routes (for quiz failures, called by system)
// router.post('/quiz-failure', authenticateToken, NotificationController.createQuizFailureNotification);
router.post('/quiz-failure', NotificationController.createQuizFailureNotification);
router.post('/email', NotificationController.sendEmailNotification);
// Legacy route (backward compatibility)
router.get('/legacy', NotificationController.getAllNotifications);

module.exports = router;