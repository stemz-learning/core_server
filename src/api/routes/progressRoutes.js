const express = require('express');
const ProgressController = require('../controllers/progressController');
const router = express.Router();

// ========================================
// GET ROUTES - Retrieve Progress Data
// ========================================

// Get all progress records
router.get('/', ProgressController.getAllProgress);

// Get progress by user ID
router.get('/user/:user_id', ProgressController.getProgressByUserId);

// Get progress by course name
router.get('/course/:course_name', ProgressController.getProgressByCourseName);

// Get progress by assignment type (worksheet, lesson, quiz)
router.get('/type/:assignment_type', ProgressController.getProgressByAssignmentType);

// Get course completion percentage for a user (MUST come before user/:user_id/type/:assignment_type)
router.get('/user/:user_id/course/:course_name/completion', ProgressController.getCourseCompletionPercentage);

// Get progress by user ID and assignment type
router.get('/user/:user_id/type/:assignment_type', ProgressController.getProgressByUserAndType);

// Get progress by course and assignment number
router.get('/course/:course_name/assignment/:assignment_number', ProgressController.getProgressByCourseAndAssignment);

// Get progress statistics for a user
router.get('/user/:user_id/stats', ProgressController.getUserProgressStats);

// Get progress by ID
router.get('/:id', ProgressController.getProgressById);
// ========================================
// POST ROUTES - Create Progress Data
// ========================================

// Create new progress record
router.post('/', ProgressController.createProgress);

// Bulk create progress records
router.post('/bulk', ProgressController.bulkCreateProgress);

// ========================================
// PUT ROUTES - Update Progress Data
// ========================================

// Update entire progress record
router.put('/:id', ProgressController.updateProgress);

// Update only progress data (partial update)
router.put('/:id/data', ProgressController.updateProgressData);

// ========================================
// DELETE ROUTES - Remove Progress Data
// ========================================

// Delete specific progress record
router.delete('/:id', ProgressController.deleteProgress);

// Delete all progress for a user
router.delete('/user/:user_id', ProgressController.deleteUserProgress);

module.exports = router; 