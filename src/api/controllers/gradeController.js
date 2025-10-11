const Grade = require("../models/gradeModel");

class GradeController {
    // Get all grades in all classrooms/courses
    static async getAllGrades(req, res) {
        try {
            const grades = await Grade.find();
            res.status(200).json(grades);
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve grades" });
        }
    }

    // Get a grade by the grade ID
    static async getGrade(req, res) {
        try {
            const grade = await Grade.findById(req.params.id);
            if (!grade) {
                return res.status(404).json({ message: "Grade not found" });
            }
            res.status(200).json(grade);
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve grade" });
        }
    }

    // Create a new grade entry
    static async createGrade(req, res) {
        try {
            const newGrade = new Grade(req.body);
            await newGrade.save();
            res.status(201).json(newGrade);
        } catch (error) {
            res.status(500).json({ message: "Failed to create grade" });
        }
    }

    // Update an existing grade entry
    static async updateGrade(req, res) {
        try {
            const updatedGrade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedGrade) {
                return res.status(404).json({ message: "Grade not found" });
            }
            res.status(200).json(updatedGrade);
        } catch (error) {
            res.status(500).json({ message: "Failed to update grade" });
        }
    }

    // Delete a grade by ID
    static async deleteGrade(req, res) {
        try {
            const deletedGrade = await Grade.findByIdAndDelete(req.params.id);
            if (!deletedGrade) {
                return res.status(404).json({ message: "Grade not found" });
            }
            res.status(200).json({ message: "Grade deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete grade" });
        }
    }

    // Get all grades in a classroom
    static async getGradesByClassroom(req, res) {
        try {
            const { classroomId } = req.params;
            const grades = await Grade.find({ classroom_id: classroomId });
    
            if (!grades.length) {
                return res.status(404).json({ message: "No grades found for this classroom" });
            }
    
            res.status(200).json(grades);
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve grades for classroom" });
        }
    }

    // Get all grades from a course in a classroom by classroom ID and course ID
    static async getGradesByCourseInClassroom(req, res) {
        try { 
            const { classroomId, courseId } = req.params;
            const grades = await Grade.find({ classroom_id: classroomId, course_id: courseId });
    
            if (!grades.length) {
                return res.status(404).json({ message: "No grades found for this course in the specified classroom" });
            }
    
            res.status(200).json(grades);
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve grades for the course in the classroom" });
        }
    }
    
}

module.exports = GradeController;
