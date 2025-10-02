const mongoose = require('mongoose');

const physicalClassroomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    maxLength: 100,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  // Teacher who manages this physical classroom
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  // Students enrolled in this physical classroom
  studentIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Physical classroom details
  schoolName: { 
    type: String, 
    required: false,
    trim: true
  },
  gradeLevel: { 
    type: String, 
    required: false,
    enum: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  academicYear: { 
    type: String, 
    required: false // e.g., "2024-2025"
  },
  classroomNumber: { 
    type: String, 
    required: false,
    trim: true
  },
  
  // Operational details
  isActive: { 
    type: Boolean, 
    default: true 
  },
  maxStudents: { 
    type: Number, 
    default: 100
  },
  
  // Metadata
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
  collection: 'physicalclassrooms'
});

// Index for efficient queries
physicalClassroomSchema.index({ teacherId: 1 });
physicalClassroomSchema.index({ studentIds: 1 });
physicalClassroomSchema.index({ isActive: 1 });

// Virtual for student count
physicalClassroomSchema.virtual('studentCount').get(function() {
  return this.studentIds ? this.studentIds.length : 0;
});

// Method to check if classroom is full
physicalClassroomSchema.methods.isFull = function() {
  return this.studentCount >= this.maxStudents;
};

// Method to add student
physicalClassroomSchema.methods.addStudent = function(studentId) {
  if (!this.studentIds.includes(studentId) && !this.isFull()) {
    this.studentIds.push(studentId);
    return true;
  }
  return false;
};

// Method to remove student
physicalClassroomSchema.methods.removeStudent = function(studentId) {
  this.studentIds = this.studentIds.filter(id => !id.equals(studentId));
  return true;
};

const PhysicalClassroom = mongoose.model('PhysicalClassroom', physicalClassroomSchema);

module.exports = PhysicalClassroom;