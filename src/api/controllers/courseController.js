const Course = require("../models/courseModel");

class CourseController {
    // Get all courses
    static async getAllCourses(req, res) {
        try {
            const courses = await Course.find();
            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve courses" });
        }
    }

    // Get a course by its ID
    static async getCourse(req, res) {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve course" });
        }
    }

    // Create a new course
    static async createCourse(req, res){
        try{
            const newCourse = new Course(req.body);
            await newCourse.save();
            res.status(201).json(newCourse);
        } catch (error) {
            res.status(400).json({message: "Failed to create course", error});
        }
    }

    // Update a course by its ID
    static async updateCourse(req, res){
        try {
            const updatedCourse = await Course.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!updatedCourse) {
                return res.status(404).json({ message: "Course not found"});
            }
            res.status(200).json(updatedCourse);
        } catch (error) {
            res.status(500).json({ message: "Failed to update course"});
        }
    }

    // Delete a course by its ID
    static async deleteCourse(req, res) {
        try {
            const course = await Course.findByIdAndDelete(req.params.id);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
            res.status(200).json({ message: "Course deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete course" });
        }
    }
}

module.exports = CourseController;
