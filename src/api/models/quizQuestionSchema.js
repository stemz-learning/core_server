const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  course_id: { type: String, required: true, lowercase: true },
  gradeRange: { type: [String], required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  score: { type: Number, required: true },
  correctAnswerIndex: { type: Number, required: true },
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
