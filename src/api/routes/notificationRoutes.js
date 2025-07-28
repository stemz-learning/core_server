const express = require('express');
const { NotificationController } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', NotificationController.getAllNotifications);
router.post('/email', NotificationController.sendEmailNotification);

module.exports = router;
