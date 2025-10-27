const express = require('express');
const portalCourseController = require('../controllers/portalCourseController');

const router = express.Router();

// router.post('/seed', courseController.seedCourses);
router.get('/', portalCourseController.getAllCourses); // Get all courses
router.post('/', portalCourseController.createCourse); // Create a new course
router.get('/:id', portalCourseController.getCourse); // Get one course by ID
router.put('/:id', portalCourseController.updateCourse); // Update a course by ID
router.delete('/:id', portalCourseController.deleteCourse); // Delete a course by ID

module.exports = router;
