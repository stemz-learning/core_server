const express = require('express');
const router = express.Router();
const { getQuizQuestions } = require('../controllers/quizQuestionController');

router.get('/', getQuizQuestions);

module.exports = router;
