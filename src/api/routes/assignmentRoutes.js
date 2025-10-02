const express = require('express');
const AssignmentController = require('../controllers/assignmentController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// Student routes
router.get('/my-assignments', authenticateToken, AssignmentController.getStudentAssignments);
router.get('/upcoming', authenticateToken, AssignmentController.getUpcomingAssignments);
router.get('/course/:courseName', authenticateToken, AssignmentController.getCourseAssignments);

// Classroom-specific routes
router.get('/classroom/:classroomId', authenticateToken, AssignmentController.getClassroomAssignments);

// Teacher routes
router.get('/my-created', authenticateToken, AssignmentController.getTeacherAssignments);
router.post('/', authenticateToken, AssignmentController.createAssignment);
router.put('/:assignmentId', authenticateToken, AssignmentController.updateAssignment);
router.delete('/:assignmentId', authenticateToken, AssignmentController.deleteAssignment);

// Individual assignment routes
router.get('/:assignmentId', authenticateToken, AssignmentController.getAssignmentById);

module.exports = router;