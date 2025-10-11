const express = require("express");
const PhysicalClassroomController = require("../controllers/physicalClassroomController");
const { authenticateToken } = require("../controllers/authController");

const router = express.Router();

// Public routes (for basic info display)
router.get("/basic-info", PhysicalClassroomController.getPhysicalClassroomsBasicInfo);

// Protected routes
router.get("/", PhysicalClassroomController.getAllPhysicalClassrooms);


// User-specific routes
router.get("/my-classrooms/:userId", PhysicalClassroomController.getUserPhysicalClassrooms);


// Classroom management routes
router.post("/", PhysicalClassroomController.createPhysicalClassroom);
router.get("/:id", PhysicalClassroomController.getPhysicalClassroom);
router.put("/:id", PhysicalClassroomController.updatePhysicalClassroom);
router.delete("/:id", PhysicalClassroomController.deletePhysicalClassroom);

// Student management routes
router.get("/:id/students", PhysicalClassroomController.getClassroomStudents);

router.post("/:id/add-student", PhysicalClassroomController.addStudentToClassroom);
router.post("/:id/remove-student", PhysicalClassroomController.removeStudentFromClassroom);

module.exports = router;