const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
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

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
