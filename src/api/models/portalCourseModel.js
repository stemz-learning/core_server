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
  ],
  lesson_1: { type: Boolean, default: false },
  lesson_2: { type: Boolean, default: false },
  lesson_3: { type: Boolean, default: false },
  lesson_4: { type: Boolean, default: false },
  lesson_5: { type: Boolean, default: false },

  ws_1: { type: Boolean, default: false },
  ws_2: { type: Boolean, default: false },
  ws_3: { type: Boolean, default: false },
  ws_4: { type: Boolean, default: false },
  ws_5: { type: Boolean, default: false },

  quiz_1: { type: Boolean, default: false },
  quiz_2: { type: Boolean, default: false },
  quiz_3: { type: Boolean, default: false },
  quiz_4: { type: Boolean, default: false },
  quiz_5: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("portalCourse", portalCourseSchema, "courses");
