const Assignment = require("../models/Assignment");
const PhysicalClassroom = require("../models/PhysicalClassroom");
const Notification = require("../models/Notification");

class AssignmentController {
  // Get assignments for a specific physical classroom
  static async getClassroomAssignments(req, res) {
    try {
      const { classroomId } = req.params;
      const userId = req.user?.id;

      // Verify user has access to this classroom (teacher or student)
      const classroom = await PhysicalClassroom.findById(classroomId);
      if (!classroom) {
        return res
          .status(404)
          .json({ message: "Physical classroom not found" });
      }

      const hasAccess =
        classroom.teacherId.toString() === userId ||
        classroom.studentIds.includes(userId);

      if (!hasAccess) {
        return res
          .status(403)
          .json({ message: "Access denied to this classroom" });
      }

      const assignments = await Assignment.findByPhysicalClassroom(
        classroomId
      ).sort({ createdAt: -1 });

      res.status(200).json(assignments);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error fetching classroom assignments:", error);
      }
      res.status(500).json({
        message: "Failed to fetch classroom assignments",
        error: error.message,
      });
    }
  }

  // Get assignments for a student (all their physical classrooms)
  static async getStudentAssignments(req, res) {
    try {
      const userId = req.user.id;

      // Find all physical classrooms user is enrolled in
      const userClassrooms = await PhysicalClassroom.find({
        studentIds: userId,
        isActive: true,
      });

      const classroomIds = userClassrooms.map((c) => c._id);

      const assignments = await Assignment.find({
        physicalClassroomId: { $in: classroomIds },
        isActive: true,
      })
        .populate("physicalClassroomId", "name")
        .populate("teacherId", "name")
        .sort({ createdAt: -1 });

      res.status(200).json(assignments);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error fetching student assignments:", error);
      }
      res.status(500).json({
        message: "Failed to fetch assignments",
        error: error.message,
      });
    }
  }

  // Get assignments for a specific course (for displaying on course pages)
  static async getCourseAssignments(req, res) {
    try {
      const { courseName } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(200).json([]); // Return empty if no auth
      }

      // Find physical classrooms user is enrolled in
      const userClassrooms = await PhysicalClassroom.find({
        studentIds: userId,
        isActive: true,
      });

      const classroomIds = userClassrooms.map((c) => c._id);

      const assignments = await Assignment.find({
        physicalClassroomId: { $in: classroomIds },
        course: courseName,
        isActive: true,
      })
        .populate("physicalClassroomId", "name")
        .populate("teacherId", "name")
        .sort({ createdAt: -1 });

      res.status(200).json(assignments);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error fetching course assignments:", error);
      }
      res.status(500).json({
        message: "Failed to fetch course assignments",
        error: error.message,
      });
    }
  }

  // Create new assignment (teacher only)
  static async createAssignment(req, res) {
    try {
      const {
        physicalClassroomId,
        title,
        description,
        course,
        lesson,
        activityType,
        activityTitle,
        dueDate,
        priority,
      } = req.body;

      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify classroom exists and user is the teacher
      const classroom = await PhysicalClassroom.findById(physicalClassroomId);
      if (!classroom) {
        return res
          .status(404)
          .json({ message: "Physical classroom not found" });
      }

      if (classroom.teacherId.toString() !== teacherId) {
        return res
          .status(403)
          .json({
            message: "Only the classroom teacher can create assignments",
          });
      }

      // Create assignment
      const assignment = new Assignment({
        physicalClassroomId,
        teacherId,
        title,
        description,
        course,
        lesson,
        activityType,
        activityTitle,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "medium",
      });

      await assignment.save();

      // Create notifications for all students in the classroom
      try {
        await Notification.createAssignmentNotifications(
          assignment,
          physicalClassroomId
        );
      } catch (notifError) {
        if (process.env.NODE_ENV !== 'test') {
          console.error("Error creating assignment notifications:", notifError);
        }
        // Continue even if notifications fail
      }

      // Populate the response
      await assignment.populate([
        { path: "physicalClassroomId", select: "name" },
        { path: "teacherId", select: "name email" },
      ]);

      res.status(201).json({
        message: "Assignment created successfully",
        assignment,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error creating assignment:", error);
      }
      res.status(500).json({
        message: "Failed to create assignment",
        error: error.message,
      });
    }
  }

  // Update assignment (teacher only)
  static async updateAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Verify user is the teacher who created this assignment
      if (assignment.teacherId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update fields
      const updateData = { ...req.body };
      delete updateData.physicalClassroomId; // Don't allow changing classroom
      delete updateData.teacherId; // Don't allow changing teacher
      updateData.updatedAt = new Date();

      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updatedAssignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("physicalClassroomId", "name")
        .populate("teacherId", "name email");

      res.status(200).json({
        message: "Assignment updated successfully",
        assignment: updatedAssignment,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error updating assignment:", error);
      }
      res.status(500).json({
        message: "Failed to update assignment",
        error: error.message,
      });
    }
  }

  // Delete/Archive assignment (teacher only)
  static async deleteAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Verify user is the teacher who created this assignment
      if (assignment.teacherId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Soft delete by setting isActive to false
      assignment.isActive = false;
      assignment.updatedAt = new Date();
      await assignment.save();

      // Also mark related notifications as inactive
      await Notification.updateMany(
        { assignmentId: assignmentId },
        { isActive: false, updatedAt: new Date() }
      );

      res.status(200).json({
        message: "Assignment deleted successfully",
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error deleting assignment:", error);
      }
      res.status(500).json({
        message: "Failed to delete assignment",
        error: error.message,
      });
    }
  }

  // Get assignments by teacher (for teacher dashboard)
  static async getTeacherAssignments(req, res) {
    try {
      const teacherId = req.user.id;

      const assignments = await Assignment.find({
        teacherId,
        isActive: true,
      })
        .populate("physicalClassroomId", "name")
        .sort({ createdAt: -1 });

      res.status(200).json(assignments);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error fetching teacher assignments:", error);
      }
      res.status(500).json({
        message: "Failed to fetch teacher assignments",
        error: error.message,
      });
    }
  }

  // Get assignment details by ID
  static async getAssignmentById(req, res) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      const assignment = await Assignment.findById(assignmentId)
        .populate("physicalClassroomId", "name teacherId studentIds")
        .populate("teacherId", "name email");

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Check if user has access (teacher or enrolled student)
      const classroom = assignment.physicalClassroomId;
      const hasAccess =
        classroom.teacherId.toString() === userId ||
        classroom.studentIds.includes(userId);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.status(200).json(assignment);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error fetching assignment:", error);
      }
      res.status(500).json({
        message: "Failed to fetch assignment",
        error: error.message,
      });
    }
  }

  // Get upcoming assignments for a student
  static async getUpcomingAssignments(req, res) {
    try {
      const userId = req.user.id;
      const days = parseInt(req.query.days) || 7; // Default to next 7 days

      const userClassrooms = await PhysicalClassroom.find({
        studentIds: userId,
        isActive: true,
      });

      const classroomIds = userClassrooms.map((c) => c._id);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const assignments = await Assignment.find({
        physicalClassroomId: { $in: classroomIds },
        isActive: true,
        dueDate: { $lte: futureDate, $gte: new Date() },
      })
        .populate("physicalClassroomId", "name")
        .populate("teacherId", "name")
        .sort({ dueDate: 1 });

      res.status(200).json(assignments);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error("Error fetching upcoming assignments:", error);
      }
      res.status(500).json({
        message: "Failed to fetch upcoming assignments",
        error: error.message,
      });
    }
  }

}

module.exports = AssignmentController;
