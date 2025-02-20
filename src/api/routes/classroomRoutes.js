// src/routes/classroomRoutes.js

const express = require("express");
const {
  createClassroom,
  getClassroom,
  updateClassroom,
  deleteClassroom,
  getAllClassrooms,
  enrollInClassroom,
  unenrollFromClassroom,
  getUserClassrooms,
} = require("../controllers/classroomController");

const { authenticateToken } = require("../controllers/authController");

const router = express.Router();

// Use RESTful route conventions
router.post("/", createClassroom); // Create a new classroom
router.get("/", getAllClassrooms); // Get all classrooms
router.get("/:id", getClassroom); // Get a single classroom by ID
router.put("/:id", updateClassroom); // Update a classroom by ID
router.delete("/:id", deleteClassroom); // Delete a classroom by ID
router.post("/:id/enroll", authenticateToken, enrollInClassroom); // Enroll in a classroom by ID
router.post("/:id/unenroll", authenticateToken, unenrollFromClassroom); // Unenroll from a classroom by ID
router.get("/user/getUserClassrooms", authenticateToken, getUserClassrooms); // Get all classrooms for a user by ID

module.exports = router;
