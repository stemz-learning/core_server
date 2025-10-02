const mongoose = require('mongoose');

// Define the progress schema
const progressSchema = new mongoose.Schema({
    course_name: { type: String, required: true },
    assignment_type: { 
        type: String, 
        required: true,
        enum: ['worksheet', 'lesson', 'quiz']
    },
    assignment_number: { type: String, required: true },
    user_id: { type: String, required: true },
    progress: { type: JSON, required: true },
}, { timestamps: true });

// Create the progress model
const Progress = mongoose.model('Progress', progressSchema);

// Export the model
module.exports = Progress; 
