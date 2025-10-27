const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
  senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxLength: 5000 },
  attachments: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'file', 'link'], default: 'file' },
    name: { type: String },
  }],
  editedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

// Indexes to support retrieval by group and chronological order
groupMessageSchema.index({ groupId: 1, createdAt: 1 });
groupMessageSchema.index({ senderUserId: 1, createdAt: -1 });

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

module.exports = GroupMessage;
