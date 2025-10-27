// models/studentResponseSchema.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const bpqEventSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, enum: ['start_typing', 'text_change', 'submit'], required: true },
  value: { type: String, required: true },
  cursorPos: { type: Number }
})


const bpqResponseSchema = new Schema({
  questionId: String,
  initialAnswer: String,
  finalAnswer: String,
  feedback: String,
  scores: {
    Creativity: { type: Number, min: 0, max: 20 },
    'Critical Thinking': { type: Number, min: 0, max: 20 },
    Observation: { type: Number, min: 0, max: 20 },
    Curiosity: { type: Number, min: 0, max: 20 },
    'Problem Solving': { type: Number, min: 0, max: 20 },
  },
  events: [bpqEventSchema],
  timestamp: { type: Date, default: Date.now },
});

const worksheetAnswerSchema = new Schema({
  questionId: String,
  type: { type: String, enum: ['multiple_choice', 'short_answer', 'match', 'drag_drop', 'fill_blank'], default: 'short_answer' },
  response: Schema.Types.Mixed,
  correct: Boolean,
});

const quizEventSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, enum: ['select', 'deselect', 'submit', 'partial-save'], required: true },
  value: { type: String, required: true }
  cursorPos: { type: Number }
})

const quizAnswerSchema = new Schema({
  questionId: String,
  selectedAnswer: String,
  correct: Boolean,
  events: [quizEventSchema]
});

const quizAttemptSchema = new Schema({
  attemptNumber: Number,
  answers: [quizAnswerSchema],
  score: Number,
  total: Number,
  submittedAt: { type: Date, default: Date.now },
});

const lessonResponseSchema = new Schema({
  lessonId: String,
  bpqResponses: [bpqResponseSchema],
  worksheet: {
    worksheetId: String,
    answers: [worksheetAnswerSchema],
    submittedAt: { type: Date, default: Date.now },
    attemptNumber: Number,
    score: Number,
    feedback: String,
  },
  quiz: [quizAttemptSchema],
});

const studentResponseSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  responses: [lessonResponseSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudentResponse', studentResponseSchema);
