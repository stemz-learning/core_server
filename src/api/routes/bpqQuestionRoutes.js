const express = require('express');
const router = express.Router();
const { getBpqQuestions } = require('../controllers/bpqQuestionController');

router.get('/', getBpqQuestions);

module.exports = router;
