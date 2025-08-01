const mongoose = require("mongoose");

const portalCourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, lowercase: true },
  courseName: { type: String, required: true },
  courseDescription: { type: String, required: true },
  lessons: [
    {
      lessonId: { type: String, required: true },
      lessonName: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model("portalCourse", portalCourseSchema, "courses");
