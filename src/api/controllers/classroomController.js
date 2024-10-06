// src/controllers/classroomController.js
const Classroom = require('../models/classroomModel');
const connectDB = require('../mongodb');

// Get all classrooms
const getAllClassrooms = async (req, res) => {
  try {
    await connectDB();
    const classrooms = await Classroom.find();
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve classrooms' });
  }
};

// Get a single classroom by ID
const getClassroom = async (req, res) => {
  try {
    await connectDB();
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.status(200).json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve classroom' });
  }
};

// Create a new classroom
const createClassroom = async (req, res) => {
  try {
    await connectDB();
    const newClassroom = new Classroom(req.body);
    await newClassroom.save();
    res.status(201).json(newClassroom);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create classroom', error });
  }
};

// Update a classroom by ID
const updateClassroom = async (req, res) => {
  try {
    await connectDB();
    const updatedClassroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClassroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.status(200).json(updatedClassroom);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update classroom' });
  }
};

// Delete a classroom by ID
const deleteClassroom = async (req, res) => {
  try {
    await connectDB();
    const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!deletedClassroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.status(200).json({ message: 'Classroom deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete classroom' });
  }
};

module.exports = {
  getAllClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
};
