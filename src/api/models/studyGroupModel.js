const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  name: { type: String, required: false, maxLength: 120 },
  memberUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessageAt: { type: Date, default: null },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes to speed up common queries
studyGroupSchema.index({ classroomId: 1, updatedAt: -1 });
studyGroupSchema.index({ memberUserIds: 1 });

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);

module.exports = StudyGroup;


