// src/controllers/classroomController.js
const Classroom = require("../models/classroomModel");
const connectDB = require("../mongodb");
const mongoose = require('mongoose');


// Get all classrooms
const getAllClassrooms = async (req, res) => {
  try {
    await connectDB();
    const classrooms = await Classroom.find();
    res.status(200).json(classrooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve classrooms" });
  }
};

// Get a single classroom by ID
const getClassroom = async (req, res) => {
  try {
    await connectDB();
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    res.status(200).json(classroom);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve classroom" });
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
    res.status(400).json({ message: "Failed to create classroom", error });
  }
};

// Update a classroom by ID
const updateClassroom = async (req, res) => {
  try {
    await connectDB();
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    res.status(200).json(updatedClassroom);
  } catch (error) {
    res.status(500).json({ message: "Failed to update classroom" });
  }
};

// Delete a classroom by ID
const deleteClassroom = async (req, res) => {
  try {
    await connectDB();
    const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!deletedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    res.status(200).json({ message: "Classroom deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete classroom" });
  }
};

const enrollInClassroom = async (req, res) => {
  try {
    await connectDB();
    const { id: classroomId } = req.params;
    const userId = req.user.id;  // Get from token

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.student_user_ids.includes(userId)) {
      return res.status(400).json({ message: "User already enrolled in this classroom" });
    }

    classroom.student_user_ids.push(userId);
    await classroom.save();

    res.status(200).json({
      message: "Successfully enrolled in classroom",
      classroom,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to enroll in classroom",
      error: error.message,
    });
  }
};

// remove a user from a classroom given a user ID
const unenrollFromClassroom = async (req, res) => {
  try {
    await connectDB();
    const { id: classroomId } = req.params;
    const userId = req.user.id;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Convert IDs to strings for comparison
    const userIdStr = userId.toString();
    const studentIds = classroom.student_user_ids.map(id => id.toString());

    if (!studentIds.includes(userIdStr)) {
      return res.status(400).json({ message: "User not enrolled in this classroom" });
    }

    // Filter out the user ID as string
    classroom.student_user_ids = classroom.student_user_ids.filter(id => 
      id.toString() !== userIdStr
    );
    
    await classroom.save();

    res.status(200).json({
      message: "Successfully unenrolled from classroom",
      classroom
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to unenroll from classroom",
      error: error.message
    });
  }
};


const getUserClassrooms = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user.id;  // Get from token
    
    console.log('Looking for user ID:', userId);

    const classrooms = await Classroom.find();
    
    // Use exact string comparison
    const enrolled = classrooms.filter(classroom => 
      classroom.student_user_ids.includes(userId)
    );

    const teaching = classrooms.filter(classroom => 
      classroom.teacher_user_id === userId
    );

    res.status(200).json({
      enrolled: enrolled,
      teaching: teaching
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve user classrooms',
      error: error.message 
    });
  }
};

module.exports = {
  getAllClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  enrollInClassroom,
  unenrollFromClassroom,
  getUserClassrooms,
};
