const express = require("express");
const {
  seedCourses,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const router = express.Router();

router.post('/seed', seedCourses);
router.get("/", getAllCourses); // Get all courses
router.get("/:course_id", getCourseById); // Get one course by course_id
router.post("/", createCourse); // Create a new course
router.put("/:course_id", updateCourse); // Update a course by course_id
router.delete("/:course_id", deleteCourse); // Delete a course by course_id


module.exports = router;
