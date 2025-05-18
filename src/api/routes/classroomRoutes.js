// src/routes/classroomRoutes.js
const express = require("express");
const {
  createClassroom,
  getClassroom,
  updateClassroom,
  deleteClassroom,
  enrollInClassroom,
  unenrollFromClassroom,
  getUserClassrooms,
  getAllClassroomsWithIDs,
  getAllClassroomsWithNames,
} = require("../controllers/classroomController");

const { authenticateToken } = require("../controllers/authController");

const router = express.Router();

// Important: Put specific routes before parameterized routes
// Get all classrooms routes need to be before /:id route
router.get("/allIDs", getAllClassroomsWithIDs); // Get all classrooms with IDs
router.get("/allNames", getAllClassroomsWithNames); // Get all classrooms with names
router.get("/user/getUserClassrooms", authenticateToken, getUserClassrooms); // Get all classrooms for a user by ID

// Other RESTful routes 
router.post("/", createClassroom); // Create a new classroom
router.get("/:id", getClassroom); // Get a single classroom by ID - moved after specific routes
router.put("/:id", updateClassroom); // Update a classroom by ID
router.delete("/:id", deleteClassroom); // Delete a classroom by ID
router.post("/:id/enroll", authenticateToken, enrollInClassroom); // Enroll in a classroom by ID
router.post("/:id/unenroll", authenticateToken, unenrollFromClassroom); // Unenroll from a classroom by ID

module.exports = router;