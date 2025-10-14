const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

// router.post('/seed', courseController.seedCourses);
router.get('/', courseController.getAllCourses); // Get all courses
router.post('/', courseController.createCourse); // Create a new course
router.get('/:id', courseController.getCourse); // Get one course by ID
router.put('/:id', courseController.updateCourse); // Update a course by ID
router.delete('/:id', courseController.deleteCourse); // Delete a course by ID

module.exports = router;
