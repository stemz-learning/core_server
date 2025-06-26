const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  teacher_user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  student_user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  course_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}], //New field
  schedule: { type: String, required: false }, // New field
  recommendedGradeLevel: { type: String, required: false }, // New field
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
  quiz: { type: Boolean, default: false },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
