// src/routes/classroomRoutes.js
const express = require("express");
const classroomController = require("../controllers/classroomController");

const { authenticateToken } = require("../controllers/authController");

const router = express.Router();

// Important: Put specific routes before parameterized routes
// Get all classrooms routes need to be before /:id route
router.get("/", classroomController.getAllClassrooms); // Get all classrooms
router.get("/allIDs", classroomController.getAllClassroomsWithIDs); // Get all classrooms with IDs
router.get("/allNames", classroomController.getAllClassroomsWithNames); // Get all classrooms with names
router.get("/user/getUserClassrooms", authenticateToken, classroomController.getUserClassrooms); // Get all classrooms for a user by ID

// Other RESTful routes 
router.post("/", classroomController.createClassroom); // Create a new classroom
router.get("/:id", classroomController.getClassroom); // Get a single classroom by ID - moved after specific routes
router.put("/:id", classroomController.updateClassroom); // Update a classroom by ID
router.delete("/:id", classroomController.deleteClassroom); // Delete a classroom by ID
router.get("/:id/users", classroomController.getClassroomUsers); // Get all users in a classroom by ID
router.get("/:id/courses", classroomController.getClassroomCourses); // Get all courses in a classroom by ID
router.post("/:id/enroll", authenticateToken, classroomController.enrollInClassroom); // Enroll in a classroom by ID
router.post("/:id/unenroll", authenticateToken, classroomController.unenrollFromClassroom); // Unenroll from a classroom by ID

module.exports = router;