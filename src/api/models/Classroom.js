const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true },
  teacher_user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  student_user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  course_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // New field
  schedule: { type: String, required: false }, // New field
  recommendedGradeLevel: { type: String, required: false }, // New field
}, { timestamps: true });

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
