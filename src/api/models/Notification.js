const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who receives this notification (individual student)
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },

  // Who sent this notification (teacher, or null for system)
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User',
  },

  // Which PHYSICAL classroom this belongs to
  physicalClassroomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'PhysicalClassroom',
  },

  // Notification type and content
  type: {
    type: String,
    required: true,
    enum: ['announcement', 'assignment', 'quiz_failure', 'reminder'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000,
  },

  // For linking to specific self-paced course content
  targetCourse: {
    type: String,
    required: false,
    enum: [
      'astronomy',
      'chemistry',
      'basicsOfCoding',
      'biochemistry',
      'circuits',
      'environmentalScience',
      'psychology',
      'statistics',
      'zoology',
    ],
  },
  targetLesson: {
    type: String,
    required: false,
    match: /^lesson\d+$/,
  },
  targetActivity: {
    type: String,
    required: false,
    enum: ['quiz', 'worksheet', 'video'],
  },
  linkUrl: {
    type: String,
    required: false, // Direct URL to static content
  },

  // Assignment-specific fields
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Assignment',
  },
  dueDate: {
    type: Date,
    required: false,
  },

  // Quiz failure specific fields
  quizFailureDetails: {
    score: { type: Number, required: false },
    maxScore: { type: Number, required: false },
    scorePercent: { type: Number, required: false },
    failureType: {
      type: String,
      enum: ['red', 'yellow'], // red = <50%, yellow = 50-70%
      required: false,
    },
  },

  // Status tracking
  isRead: {
    type: Boolean,
    default: false,
  },
  isDismissed: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    required: false,
  },
  dismissedAt: {
    type: Date,
    required: false,
  },

  // Priority and scheduling
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  scheduledFor: {
    type: Date,
    required: false, // For future notifications
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'notifications',
});

// Indexes for efficient queries
notificationSchema.index({ recipientId: 1, isDismissed: 1, isActive: 1 });
notificationSchema.index({ physicalClassroomId: 1, isActive: 1 });
notificationSchema.index({ senderId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ dueDate: 1 });

// Pre-save middleware
notificationSchema.pre('save', function (next) {
  // Auto-generate link URL if target content is specified
  if (this.targetCourse && this.targetLesson && this.targetActivity && !this.linkUrl) {
    this.linkUrl = `/${this.targetCourse}/${this.targetLesson}/${this.targetActivity}`;
  }

  // Set read/dismissed timestamps
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  if (this.isDismissed && !this.dismissedAt) {
    this.dismissedAt = new Date();
  }

  this.updatedAt = new Date();
  next();
});

// Virtual for checking if notification is urgent
notificationSchema.virtual('isUrgent').get(function () {
  if (this.priority === 'high') return true;
  if (this.type === 'quiz_failure') return true;
  if (this.dueDate) {
    const now = new Date();
    const timeUntilDue = this.dueDate - now;
    const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
    return hoursUntilDue <= 24; // Due within 24 hours
  }
  return false;
});

// Virtual for days until due
notificationSchema.virtual('daysUntilDue').get(function () {
  if (!this.dueDate) return null;
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to dismiss
notificationSchema.methods.dismiss = function () {
  this.isDismissed = true;
  this.dismissedAt = new Date();
  return this.save();
};

// Static method to create assignment notification for all students in a classroom
notificationSchema.statics.createAssignmentNotifications = async function (assignmentData, physicalClassroomId) {
  const PhysicalClassroom = mongoose.model('PhysicalClassroom');
  const classroom = await PhysicalClassroom.findById(physicalClassroomId);

  if (!classroom) {
    throw new Error('Physical classroom not found');
  }

  const notifications = classroom.studentIds.map((studentId) => ({
    recipientId: studentId,
    senderId: assignmentData.teacherId,
    physicalClassroomId,
    type: 'assignment',
    title: `New Assignment: ${assignmentData.title}`,
    message: assignmentData.description || `Complete ${assignmentData.activityTitle} for ${assignmentData.course}`,
    targetCourse: assignmentData.course,
    targetLesson: assignmentData.lesson,
    targetActivity: assignmentData.activityType,
    assignmentId: assignmentData._id,
    dueDate: assignmentData.dueDate,
    priority: assignmentData.priority || 'medium',
  }));

  return this.insertMany(notifications);
};

// Static method to create announcement for all students in a classroom
notificationSchema.statics.createAnnouncementNotifications = async function (announcementData, physicalClassroomId) {
  const PhysicalClassroom = mongoose.model('PhysicalClassroom');
  const classroom = await PhysicalClassroom.findById(physicalClassroomId);

  if (!classroom) {
    throw new Error('Physical classroom not found');
  }

  const notifications = classroom.studentIds.map((studentId) => ({
    recipientId: studentId,
    senderId: announcementData.senderId,
    physicalClassroomId,
    type: 'announcement',
    title: announcementData.title,
    message: announcementData.message,
    priority: announcementData.priority || 'medium',
  }));

  return this.insertMany(notifications);
};

// Static method to find notifications for a student
notificationSchema.statics.findForStudent = function (studentId, options = {}) {
  const query = {
    recipientId: studentId,
    isActive: true,
  };

  if (!options.includeDismissed) {
    query.isDismissed = false;
  }

  if (options.type) {
    query.type = options.type;
  }

  return this.find(query)
    .populate('senderId', 'name')
    .populate('physicalClassroomId', 'name')
    .populate('assignmentId', 'title')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
