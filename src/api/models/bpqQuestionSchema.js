const mongoose = require('mongoose');

const bpqQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  course_id: { type: String, required: true, lowercase: true },
  lesson_id: { type: String, required: true },
  gradeLevels: { type: [String], required: true },
  timeInVideo: { type: Number, required: false },
});

module.exports = mongoose.model('BpqQuestion', bpqQuestionSchema);
