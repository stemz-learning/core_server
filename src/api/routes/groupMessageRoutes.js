const express = require('express');
const GroupMessageController = require('../controllers/groupMessageController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// Get messages in a group, sorted oldest->newest
router.get('/:groupId', authenticateToken, GroupMessageController.getMessagesByGroup);

// Post a new message to a group
router.post('/:groupId', authenticateToken, GroupMessageController.postMessage);

// Edit a message
router.put('/message/:id', authenticateToken, GroupMessageController.editMessage);

// Soft-delete a message
router.delete('/message/:id', authenticateToken, GroupMessageController.deleteMessage);

module.exports = router;


