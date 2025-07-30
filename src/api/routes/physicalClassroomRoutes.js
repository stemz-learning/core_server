const express = require("express");
const PhysicalClassroomController = require("../controllers/physicalClassroomController");
const { authenticateToken } = require("../controllers/authController");

const router = express.Router();

// Public routes (for basic info display)
router.get("/basic-info", PhysicalClassroomController.getPhysicalClassroomsBasicInfo);

// Protected routes
// Get all physical classrooms (admin/teacher view)
router.get("/", authenticateToken, PhysicalClassroomController.getAllPhysicalClassrooms);

// User-specific routes
router.get("/my-classrooms", authenticateToken, PhysicalClassroomController.getUserPhysicalClassrooms);

// Classroom management routes
router.post("/", authenticateToken, PhysicalClassroomController.createPhysicalClassroom);
router.get("/:id", authenticateToken, PhysicalClassroomController.getPhysicalClassroom);
router.put("/:id", authenticateToken, PhysicalClassroomController.updatePhysicalClassroom);
router.delete("/:id", authenticateToken, PhysicalClassroomController.deletePhysicalClassroom);

// Student management routes
router.get("/:id/students", authenticateToken, PhysicalClassroomController.getClassroomStudents);
router.post("/:id/add-student", authenticateToken, PhysicalClassroomController.addStudentToClassroom);
router.post("/:id/remove-student", authenticateToken, PhysicalClassroomController.removeStudentFromClassroom);

module.exports = router;