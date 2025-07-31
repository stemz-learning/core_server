const express = require("express");
const router = express.Router();
const {
  getStudentBPQResponses,
  getIndividualStudentResponses,
  getStudentAnalyticsScores,
  getStudentOverallScores,
  getStudentCourseScores
} = require("../controllers/teacherController");

// const { authenticateToken } = require("../controllers/authController");

// GET /api/teacher/bpq-responses/:courseId?lessonId=lesson1
router.get("/bpq-responses/:courseId", getStudentBPQResponses);

// GET /api/teacher/bpq-responses/:courseId/student/:studentId?lessonId=lesson1
router.get("/bpq-responses/:courseId/student/:studentId", getIndividualStudentResponses);

// GET /api/teachers/analytics-scores/:courseId?lessonId=1
router.get("/analytics-scores/:courseId", getStudentAnalyticsScores);

// GET /api/teacher/student-overall-scores/:studentId
router.get("/student-overall-scores/:studentId", getStudentOverallScores);

// GET /api/teacher/student-course-scores/:courseId/student/:studentId
router.get("/student-course-scores/:courseId/student/:studentId", getStudentCourseScores);

module.exports = router;