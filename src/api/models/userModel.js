const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // New field: 'role'
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },

  // New field: 'grade' only required if role is 'student'
  grade: {
    type: String,
    required: function () {
      return this.role === 'student';
    }
  },

  gradeLevel: {
    type: Number,
    required: false,
    min: 1,
    max: 6,
    default: 1
  }
}, {
  timestamps: true
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
