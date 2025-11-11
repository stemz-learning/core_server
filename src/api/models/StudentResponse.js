// models/studentResponseSchema.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

// const bpqEventSchema = new Schema({
//   timestamp: { type: Date, default: Date.now },
//   eventType: { type: String, enum: ['start_typing', 'text_change', 'submit', 'autosave'], required: true },
//   value: { type: String, default: '' },  // Changed from required to default
//   cursorPos: { type: Number, default: null }
// }, { _id: true });

// const bpqEventSchema = new Schema({
//   timestamp: { type: Date, default: Date.now },
//   eventType: { type: String, enum: ['start_typing', 'text_change', 'submit', 'autosave'], required: true },
//   value: { type: String, required: true },  // ← Change this back
//   cursorPos: { type: Number }  // ← Remove default: null
// }, { _id: true });

// const bpqResponseSchema = new Schema({
//   questionId: String,
//   // currentAnswer: String,
//   initialAnswer: String,
//   finalAnswer: String,
//   feedback: String,
//   scores: {
//     Creativity: { type: Number, min: 0, max: 20 },
//     'Critical Thinking': { type: Number, min: 0, max: 20 },
//     Observation: { type: Number, min: 0, max: 20 },
//     Curiosity: { type: Number, min: 0, max: 20 },
//     'Problem Solving': { type: Number, min: 0, max: 20 },
//   },
//   events: [bpqEventSchema],
//   // timestamp: { type: Date, default: Date.now },
// }, { _id: true, minimize: false });

const bpqEventSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, enum: ['start_typing', 'text_change', 'submit', 'autosave'], required: true },
  value: { type: String, required: true },
  cursorPos: { type: Number }
}, { _id: true });

const bpqResponseSchema = new Schema({
  questionId: { type: String },
  initialAnswer: { type: String },
  finalAnswer: { type: String },
  feedback: { type: String },
  scores: {
    Creativity: { type: Number, min: 0, max: 20 },
    'Critical Thinking': { type: Number, min: 0, max: 20 },
    Observation: { type: Number, min: 0, max: 20 },
    Curiosity: { type: Number, min: 0, max: 20 },
    'Problem Solving': { type: Number, min: 0, max: 20 },
  },
  events: { type: [bpqEventSchema], default: undefined }  // ← Changed to match quiz pattern
}, { _id: true });

const worksheetAnswerSchema = new Schema({
  questionId: String,
  type: { type: String, enum: ['multiple_choice', 'short_answer', 'match', 'drag_drop', 'fill_blank'], default: 'short_answer' },
  response: Schema.Types.Mixed,
  correct: Boolean,
}, { _id: true });

const quizEventSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String, enum: ['select', 'deselect', 'submit', 'partial-save'], required: true },
  value: { type: String, required: true },
  cursorPos: { type: Number }
}, { _id: true });

const quizAnswerSchema = new Schema({
  questionId: String,
  selectedAnswer: String,
  correct: Boolean,
  events: [quizEventSchema]
}, { _id: true });

const quizAttemptSchema = new Schema({
  attemptNumber: Number,
  answers: [quizAnswerSchema],
  score: Number,
  total: Number,
  submittedAt: { type: Date, default: Date.now },
}, { _id: true });

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
}, { _id: true, minimize: false });

const studentResponseSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  responses: [lessonResponseSchema],
  updatedAt: { type: Date, default: Date.now },
}, { minimize: false });

module.exports = mongoose.model('StudentResponse', studentResponseSchema);
