// src/routes/classroomRoutes.js

const express = require('express');
const { createClassroom, getClassroom, updateClassroom, deleteClassroom, getAllClassrooms } = require('../controllers/classroomController');
const { Classroom } = require('../models/classroomModel');
const router = express.Router();

router.post('/create', createClassroom);
router.get('/', getAllClassrooms);
router.get('/read/:id', getClassroom);
router.put('/update/:id', updateClassroom);
router.delete('/delete/:id', deleteClassroom);

module.exports = router;
