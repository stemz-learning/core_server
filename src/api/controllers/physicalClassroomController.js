const PhysicalClassroom = require("../models/physicalClassroomModel");
const User = require("../models/userModel");
const mongoose = require('mongoose');

class PhysicalClassroomController {
  // Get all physical classrooms (for admin/teacher overview)
  static async getAllPhysicalClassrooms(req, res) {
    try {
      
      const classrooms = await PhysicalClassroom.find({ isActive: true })
        .populate('teacherId', 'name email')
        .populate('studentIds', 'name email')
        .sort({ createdAt: -1 });g
      
      res.status(200).json(classrooms);
    } catch (error) {
      console.error('Error fetching physical classrooms:', error);
      res.status(500).json({ message: "Failed to retrieve physical classrooms" });
    }
  }

  // Get physical classrooms with basic info only
  static async getPhysicalClassroomsBasicInfo(req, res) {
    try {
      
      const classrooms = await PhysicalClassroom.find({ isActive: true })
        .select('name description gradeLevel schoolName studentCount')
        .populate('teacherId', 'name')
        .sort({ name: 1 });
      
      const basicInfo = classrooms.map(classroom => ({
        id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        gradeLevel: classroom.gradeLevel,
        schoolName: classroom.schoolName,
        teacherName: classroom.teacherId?.name,
        studentCount: classroom.studentCount,
        students: classroom.students
      }));

      res.status(200).json(basicInfo);
    } catch (error) {
      console.error('Error fetching basic classroom info:', error);
      res.status(500).json({ message: "Failed to retrieve classroom information" });
    }
  }

  // Get a single physical classroom by ID
  static async getPhysicalClassroom(req, res) {
    try {
      
      
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
      const classroom = await PhysicalClassroom.findById(req.params.id)
        .populate('teacherId', 'name email')
        .populate('studentIds', 'name email');
        
      if (!classroom) {
        return res.status(404).json({ message: "Physical classroom not found" });
      }
      
      res.status(200).json(classroom);
    } catch (error) {
      console.error('Error fetching physical classroom:', error);
      res.status(500).json({ message: "Failed to retrieve physical classroom" });
    }
  }

  //  creating a classroom
static async createPhysicalClassroom(req, res) {
  try {
    console.log("=== CREATE CLASSROOM DEBUG ===");
    console.log("Full request body:", JSON.stringify(req.body, null, 2));
    
    const {
      name,
      description,
      teacherId,
      schoolName,
      gradeLevel,
      academicYear,
      classroomNumber,
      maxStudents,
      students // Frontend sends this
    } = req.body;

    console.log("Raw students field:", students);
    console.log("Students array length:", Array.isArray(students) ? students.length : 'not an array');

    // Validate teacher exists
    if (teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }
      console.log("Teacher validated:", teacher.name);
    }

    // Process students array to get IDs
    let studentIds = [];
    if (students && Array.isArray(students)) {
      studentIds = students.filter(id => id && typeof id === 'string');
    }

    console.log("Final studentIds for database:", studentIds);

    const newClassroom = new PhysicalClassroom({
      name,
      description,
      teacherId,
      schoolName,
      gradeLevel,
      academicYear,
      classroomNumber,
      maxStudents: maxStudents || 50,
      studentIds: studentIds // EXPLICITLY set studentIds field
    });

    console.log("Classroom before save - studentIds:", newClassroom.studentIds);
    
    await newClassroom.save();
    console.log("Classroom saved - studentIds:", newClassroom.studentIds);
    
    // Populate the response
    await newClassroom.populate('teacherId', 'name email');
    await newClassroom.populate('studentIds', 'name email');
    
    console.log("Final populated classroom - students:", newClassroom.studentIds.length);
    
    res.status(201).json({
      message: "Physical classroom created successfully",
      classroom: newClassroom
    });
  } catch (error) {
    console.error('Error creating physical classroom:', error);
    res.status(400).json({ 
      message: "Failed to create physical classroom", 
      error: error.message 
    });
  }
}

  // Update a physical classroom by ID
  static async updatePhysicalClassroom(req, res) {
    try {
      
      
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }

      const updateData = { ...req.body };
      delete updateData.studentIds; // Prevent direct manipulation of student list
      updateData.updatedAt = new Date();

      const updatedClassroom = await PhysicalClassroom.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('teacherId', 'name email')
      .populate('studentIds', 'name email');
      
      if (!updatedClassroom) {
        return res.status(404).json({ message: "Physical classroom not found" });
      }
      
      res.status(200).json({
        message: "Physical classroom updated successfully",
        classroom: updatedClassroom
      });
    } catch (error) {
      console.error('Error updating physical classroom:', error);
      res.status(500).json({ message: "Failed to update physical classroom" });
    }
  }

  // Soft delete a physical classroom
  static async deletePhysicalClassroom(req, res) {
    try {
      
      
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
      const classroom = await PhysicalClassroom.findByIdAndUpdate(
        req.params.id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );
      
      if (!classroom) {
        return res.status(404).json({ message: "Physical classroom not found" });
      }
      
      res.status(200).json({ 
        message: "Physical classroom deleted successfully" 
      });
    } catch (error) {
      console.error('Error deleting physical classroom:', error);
      res.status(500).json({ message: "Failed to delete physical classroom" });
    }
  }

  // Add student to physical classroom
  static async addStudentToClassroom(req, res) {
    try {
      
      const { id: classroomId } = req.params;
      const { studentId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(classroomId) || !mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      console.log("Looking for student with ID:", studentId);

      const classroom = await PhysicalClassroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: "Physical classroom not found" });
      }

      // Verify student exists
      const student = await User.findById(studentId);
      if (!student) {
        console.error(`Student with ID ${studentId} not found`);
        return res.status(404).json({ message: "Student not found" });
      }

      // Check if student already enrolled
      if (classroom.studentIds.includes(studentId)) {
        return res.status(400).json({ message: "Student already enrolled in this classroom" });
      }

      // Add student using the model method
      const added = classroom.addStudent(studentId);
      if (!added) {
        return res.status(400).json({ message: "Classroom is full or student already enrolled" });
      }

      await classroom.save();
      await classroom.populate('studentIds', 'name email');

      res.status(200).json({
        message: "Student added to physical classroom successfully",
        classroom
      });
    } catch (error) {
      console.error('Error adding student to classroom:', error);
      res.status(500).json({ message: "Failed to add student to classroom" });
    }
  }

  // Remove student from physical classroom
  static async removeStudentFromClassroom(req, res) {
    try {
      
      const { id: classroomId } = req.params;
      const { studentId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(classroomId) || !mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const classroom = await PhysicalClassroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: "Physical classroom not found" });
      }

      if (!classroom.studentIds.includes(studentId)) {
        return res.status(400).json({ message: "Student not enrolled in this classroom" });
      }

      classroom.removeStudent(studentId);
      await classroom.save();
      await classroom.populate('studentIds', 'name email');

      res.status(200).json({
        message: "Student removed from physical classroom successfully",
        classroom
      });
    } catch (error) {
      console.error('Error removing student from classroom:', error);
      res.status(500).json({ message: "Failed to remove student from classroom" });
    }
  }

  // Get classrooms for a specific user (teacher or student)
  static async getUserPhysicalClassrooms(req, res) {
    try {
      const userId = req.params.userId;

      // Find classrooms where user is teacher
      const teachingClassrooms = await PhysicalClassroom.find({
        teacherId: userId,
        isActive: true
      })
      .populate('studentIds', 'name email')
      .sort({ name: 1 });

      // Find classrooms where user is student
      const enrolledClassrooms = await PhysicalClassroom.find({
        studentIds: userId,
        isActive: true
      })
      .populate('teacherId', 'name email')
      .populate('studentIds', 'name email')
      .sort({ name: 1 });

      res.status(200).json({
        teaching: teachingClassrooms,
        enrolled: enrolledClassrooms
      });
    } catch (error) {
      console.error('Error fetching user classrooms:', error);
      res.status(500).json({
        message: 'Failed to retrieve user classrooms',
        error: error.message
      });
    }
  }

  // Get students in a physical classroom
  static async getClassroomStudents(req, res) {
    try {
      
      const { id: classroomId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(classroomId)) {
        return res.status(400).json({ message: "Invalid classroom ID format" });
      }
      
      const classroom = await PhysicalClassroom.findById(classroomId)
        .populate('studentIds', 'name email createdAt')
        .populate('teacherId', 'name email');

      if (!classroom) {
        return res.status(404).json({ message: "Physical classroom not found" });
      }

      res.status(200).json({
        classroom: {
          id: classroom._id,
          name: classroom.name,
          teacher: classroom.teacherId
        },
        students: classroom.studentIds || [],
        studentCount: classroom.studentCount
      });
    } catch (error) {
      console.error("Error fetching classroom students:", error);
      res.status(500).json({ 
        message: "Failed to retrieve classroom students", 
        error: error.message 
      });
    }
  }
}

module.exports = PhysicalClassroomController;