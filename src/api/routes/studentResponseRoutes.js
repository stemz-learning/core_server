// routes/studentResponseRoutes.js
const express = require("express");
const router = express.Router();
const {
  getStudentResponses,
  addOrUpdateBPQResponse,
  submitWorksheet,
  submitQuizAttempt
} = require("../controllers/studentResponseController");

const { authenticateToken } = require("../controllers/authController");

router.get("/:courseId", authenticateToken, getStudentResponses);

router.post("/:courseId/lesson/:lessonId/bpq", authenticateToken, addOrUpdateBPQResponse);
router.post("/:courseId/lesson/:lessonId/worksheet", authenticateToken, submitWorksheet);
router.post("/:courseId/lesson/:lessonId/quiz", authenticateToken, submitQuizAttempt);

module.exports = router;
