const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: { type: Number, required: true },
  studentName: { type: String, required: true },
  assignment: { type: String, required: true },
  scoreInPercent: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
