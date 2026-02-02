const express = require('express');
const DirectMessageController = require('../controllers/directMessageController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// Get direct messages between two users
// Query params: userId, otherUserId, limit (optional)
router.get('/direct', authenticateToken, DirectMessageController.getDirectMessages);

// Send a direct message
router.post('/direct', authenticateToken, DirectMessageController.createDirectMessage);

// Get all conversations for a user
router.get('/conversations', authenticateToken, DirectMessageController.getUserConversations);

module.exports = router;
