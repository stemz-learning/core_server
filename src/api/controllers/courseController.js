const Course = require("../models/courseModel");
const connectDB = require("../mongodb");


const seedCourses = async (req, res) => {
  try {
    await connectDB();

    const existingCourses = [
      {
        course_id: 'C001',
        course_name: 'Astronomy',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: true,
        ws_2: false,
        ws_3: true,
        ws_4: false,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C002',
        course_name: 'Basics of Coding 1',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: false,
        ws_2: false,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C003',
        course_name: 'Biochemistry',
        lesson_1: true,
        lesson_2: true,
        lesson_3: false,
        lesson_4: false,
        lesson_5: false,
        ws_1: false,
        ws_2: true,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C004',
        course_name: 'Chemistry',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: false,
        ws_2: false,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C005',
        course_name: 'Circuits',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: false,
        lesson_5: false,
        ws_1: false,
        ws_2: true,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C006',
        course_name: 'Environmental Science',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: true,
        ws_2: false,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C007',
        course_name: 'Psychology',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: false,
        ws_1: true,
        ws_2: true,
        ws_3: false,
        ws_4: false,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C008',
        course_name: 'Statistics',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: true,
        ws_1: true,
        ws_2: false,
        ws_3: true,
        ws_4: true,
        ws_5: false,
        quiz: true,
      },
      {
        course_id: 'C009',
        course_name: 'Zoology',
        lesson_1: true,
        lesson_2: true,
        lesson_3: true,
        lesson_4: true,
        lesson_5: true,
        ws_1: true,
        ws_2: true,
        ws_3: false,
        ws_4: true,
        ws_5: false,
        quiz: false,
      },
      
    ];

    // Clear existing courses if you want to avoid duplicates:
    await Course.deleteMany({});

    // Insert your existing courses
    await Course.insertMany(existingCourses);

    res.status(200).json({ message: 'Courses seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed courses', error });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    await connectDB();
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve courses", error: error.message });
  }
};

// Get a single course by ID
const getCourseById = async (req, res) => {
  try {
    await connectDB();
    const course = await Course.findOne({ course_id: req.params.course_id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve course", error: error.message });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  try {
    await connectDB();
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: "Failed to create course", error: error.message });
  }
};

// Update a course by course_id
const updateCourse = async (req, res) => {
  try {
    await connectDB();
    const updatedCourse = await Course.findOneAndUpdate(
      { course_id: req.params.course_id },
      req.body,
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course", error: error.message });
  }
};

// Delete a course by course_id
const deleteCourse = async (req, res) => {
  try {
    await connectDB();
    const deletedCourse = await Course.findOneAndDelete({ course_id: req.params.course_id });
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};

module.exports = {
  seedCourses,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
