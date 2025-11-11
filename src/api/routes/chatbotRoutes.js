const express = require('express');
const router = express.Router();
const { askHandler } = require('../controllers/chatbotController');

router.post('/ask', askHandler);

module.exports = router;