// src/controllers/classroomController.js
const Classroom = require("../models/classroomModel");
const connectDB = require("../mongodb");
const mongoose = require('mongoose');
const User = require("../models/userModel");
const Course = require("../models/courseModel");


class ClassroomController {
  // Get all classrooms
  static async getAllClassroomsWithIDs(req, res) {
    try {
      await connectDB();
      const classrooms = await Classroom.find();
      res.status(200).json(classrooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve classrooms" });
    }
  }

  // Updated getAllClassrooms function
  static async getAllClassroomsWithNames(req, res) {
    try {
      await connectDB();
      const classrooms = await Classroom.find()
        .populate({
          path: 'student_user_ids',
          select: 'name email'
        })
        .populate({
          path: 'teacher_user_id',
          select: 'name email'
        });

      const simplifiedClassrooms = classrooms.map(classroom => ({
        name: classroom.name,
        description: classroom.description,
        schedule: classroom.schedule,
        recommendedGradeLevel: classroom.recommendedGradeLevel,
        students: classroom.student_user_ids.map(student => ({
          name: student.name,
          email: student.email
        })),
        teacher: classroom.teacher_user_id ? {
          name: classroom.teacher_user_id.name,
          email: classroom.teacher_user_id.email
        } : null
      }));

      res.status(200).json(simplifiedClassrooms);
    } catch (error) {
      console.error('Error getting classrooms with student details:', error);
      res.status(500).json({
        message: "Failed to retrieve classrooms with student details",
        error: error.message
      });
    }
  }

  // Get a single classroom by ID
  static async getClassroom(req, res) {
    try {
      await connectDB();
      
      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
      const classroom = await Classroom.findById(req.params.id);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      res.status(200).json(classroom);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve classroom" });
    }
  }

  // Create a new classroom
  static async createClassroom(req, res) {
    try {
      await connectDB();
      const newClassroom = new Classroom(req.body);
      await newClassroom.save();
      res.status(201).json(newClassroom);
    } catch (error) {
      res.status(400).json({ message: "Failed to create classroom", error });
    }
  }

  // Update a classroom by ID
  static async updateClassroom(req, res) {
    try {
      await connectDB();
      
      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
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
  }

  // Delete a classroom by ID
  static async deleteClassroom(req, res) {
    try {
      await connectDB();
      
      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
      const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);
      if (!deletedClassroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      res.status(200).json({ message: "Classroom deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete classroom" });
    }
  }

  static async enrollInClassroom(req, res) {
    try {
      await connectDB();
      const { id: classroomId } = req.params;
      const userId = req.user.id;

      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(classroomId)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }

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
  }

  // remove a user from a classroom given a user ID
  static async unenrollFromClassroom(req, res) {
    try {
      await connectDB();
      const { id: classroomId } = req.params;
      const userId = req.user.id;

      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(classroomId)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }

      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }

      const userIdStr = userId.toString();
      const studentIds = classroom.student_user_ids.map(id => id.toString());

      if (!studentIds.includes(userIdStr)) {
        return res.status(400).json({ message: "User not enrolled in this classroom" });
      }

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
  }

  static async getUserClassrooms(req, res) {
    try {
      await connectDB();
      const userId = req.user.id;

      const classrooms = await Classroom.find();

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
  }

  static async getClassroomUsers(req, res) {
    try {
      await connectDB();
      const classroomId = req.params.id;
      
      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(classroomId)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
      const classroom = await Classroom.findById(classroomId);

      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }

      const enrolledUsers = classroom.student_user_ids;
      const teacherUserId = classroom.teacher_user_id;

      const students = await Promise.all(
        enrolledUsers.map(async (userId) => {
          const user = await User.findById(userId);
          if (!user) {
            console.error(`User with ID ${userId} not found`);
            return null;
          }
          return {
            id: user._id,
            name: user.name,
            email: user.email,
          };
        })
      );

      const teacher = await User.findById(teacherUserId);
      if (!teacher) {
        console.error(`Teacher with ID ${teacherUserId} not found`);
        return res.status(404).json({ message: "Teacher not found" });
      }
      const teacherInfo = {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
      };

      const filteredStudents = students.filter((student) => student !== null);

      res.status(200).json({
        students: filteredStudents,
        teacher: teacherInfo,
      });
    } catch (error) {
      console.error("Error in getClassroomUsers:", error);
      res.status(500).json({ message: "Failed to retrieve classroom users", error: error.message });
    }
  }

  static async getClassroomCourses(req, res) {
    try {
      await connectDB();
      const classroomId = req.params.id;
      
      // Validate if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(classroomId)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      const course_ids = classroom.course_ids;

      const courses = await Promise.all(
        course_ids.map(async (courseId) => {
          const course = await Course.findById(courseId);
          if (!course) {
            console.error(`Course with ID ${courseId} not found`);
            return null;
          }
          return {
            id: course._id,
            name: course.name,
            description: course.description,
          };
        })
      );

      res.status(200).json(courses.filter(course => course !== null));
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve classroom courses" });
    }
  }
}

module.exports = ClassroomController;