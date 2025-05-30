const express = require('express');
const { getAllNotifications } = require('../controllers/notificationController');

const router = express.Router();

router.get('/notifs', getAllNotifications);

module.exports = router;
