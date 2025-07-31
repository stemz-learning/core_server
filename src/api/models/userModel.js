const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String, 
        enum: ["student", "teacher"],
        default: "student",
        required: true
    }, 
    grade: {
        type: String,
        required: function () {
            return this.role == 'student';
        },
        default: "K"
    },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
