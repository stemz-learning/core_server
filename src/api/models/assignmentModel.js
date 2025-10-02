const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  // Reference to the PHYSICAL classroom (not online classroom)
  physicalClassroomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'PhysicalClassroom' 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  
  // Assignment basic info
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxLength: 200
  },
  description: { 
    type: String, 
    required: false,
    trim: true,
    maxLength: 1000
  },

  // Self-paced course linking (static content)
  course: { 
    type: String, 
    required: true,
    enum: [
      'astronomy', 
      'chemistry', 
      'basicsOfCoding', 
      'biochemistry', 
      'circuits', 
      'environmentalScience', 
      'psychology', 
      'statistics', 
      'zoology'
    ]
  },
  lesson: { 
    type: String, 
    required: true,
    match: /^lesson\d+$/ // lesson1, lesson2, etc.
  },
  activityType: { 
    type: String, 
    required: true,
    enum: ['quiz', 'worksheet', 'video']
  },
  activityTitle: { 
    type: String, 
    required: true,
    trim: true
  },

  // Assignment timing and status
  dueDate: { 
    type: Date, 
    required: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Auto-generated fields
  directLink: {
    type: String,
    required: false // Will be generated: /{course}/{lesson}/{activityType}
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  collection: 'assignments'
});

// Indexes for efficient queries
assignmentSchema.index({ physicalClassroomId: 1, isActive: 1 });
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ course: 1, lesson: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ createdAt: -1 });

// Pre-save middleware to generate direct link
assignmentSchema.pre('save', function(next) {
  if (this.course && this.lesson && this.activityType) {
    this.directLink = `/${this.course}/${this.lesson}/${this.activityType}`;
  }
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Virtual for days until due
assignmentSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to get assignment status
assignmentSchema.methods.getStatus = function() {
  if (!this.isActive) return 'inactive';
  if (this.isOverdue) return 'overdue';
  if (this.daysUntilDue <= 1) return 'due-soon';
  return 'active';
};

// Static method to find assignments for a physical classroom
assignmentSchema.statics.findByPhysicalClassroom = function(classroomId, options = {}) {
  const query = { 
    physicalClassroomId: classroomId,
    isActive: true
  };
  
  if (options.course) query.course = options.course;
  if (options.activityType) query.activityType = options.activityType;
  
  return this.find(query)
    .populate('teacherId', 'name email')
    .populate('physicalClassroomId', 'name')
    .sort({ createdAt: -1 });
};

// Static method to find assignments for courses
assignmentSchema.statics.findByCourse = function(courseName, studentId) {
  // This will require finding classrooms the student is in first
  return this.model('PhysicalClassroom').find({
    studentIds: studentId,
    isActive: true
  })
  .then(classrooms => {
    const classroomIds = classrooms.map(c => c._id);
    return this.find({
      physicalClassroomId: { $in: classroomIds },
      course: courseName,
      isActive: true
    })
    .populate('teacherId', 'name')
    .populate('physicalClassroomId', 'name')
    .sort({ createdAt: -1 });
  });
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;