// src/routes/classroomRoutes.js

const express = require('express');
const {
  createClassroom,
  getClassroom,
  updateClassroom,
  deleteClassroom,
  getAllClassrooms,
} = require('../controllers/classroomController');

const router = express.Router();

// Use RESTful route conventions
router.post('/', createClassroom); // Create a new classroom
router.get('/', getAllClassrooms); // Get all classrooms
router.get('/:id', getClassroom); // Get a single classroom by ID
router.put('/:id', updateClassroom); // Update a classroom by ID
router.delete('/:id', deleteClassroom); // Delete a classroom by ID

module.exports = router;
