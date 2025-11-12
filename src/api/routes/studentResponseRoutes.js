// routes/studentResponseRoutes.js
const express = require('express');

const router = express.Router();
const {
  getStudentResponses,
  addOrUpdateBPQResponse,
  submitWorksheet,
  submitQuizAttempt,
  getStudentResponsesByStudentId,
  addBPQEvent,
  savePartialQuizAnswer,
  autosaveBPQ
} = require('../controllers/studentResponseController');

const { authenticateToken } = require('../controllers/authController');

router.get('/:courseId', authenticateToken, getStudentResponses);

router.post('/:courseId/lesson/:lessonId/bpq', authenticateToken, addOrUpdateBPQResponse);
router.post('/:courseId/lesson/:lessonId/worksheet', authenticateToken, submitWorksheet);
router.post('/:courseId/lesson/:lessonId/quiz', authenticateToken, submitQuizAttempt);
router.get('/student/:studentId', getStudentResponsesByStudentId);
router.post('/:courseId/:lessonId/bpqEvent', addBPQEvent);
router.post("/:courseId/lesson/:lessonId/quiz/partial", authenticateToken, savePartialQuizAnswer);
router.post('/:courseId/lesson/:lessonId/bpq/autosave', authenticateToken, autosaveBPQ);

router.post('/test-events', authenticateToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Check if model already exists, if not create it
    let TestModel;
    try {
      TestModel = mongoose.model('TestEvents');
    } catch (e) {
      TestModel = mongoose.model('TestEvents', new mongoose.Schema({
        data: mongoose.Schema.Types.Mixed
      }));
    }

    const testDoc = new TestModel({
      data: {
        questionId: "test_q1",
        events: [
          { timestamp: new Date(), eventType: "autosave", value: "test1" },
          { timestamp: new Date(), eventType: "autosave", value: "test2" }
        ]
      }
    });

    await testDoc.save();
    return res.json({ success: true, message: "Test saved" });
  } catch (err) {
    console.error('Test endpoint error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
