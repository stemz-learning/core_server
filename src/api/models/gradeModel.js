const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    id: { type: Number },
    worksheet: { type: mongoose.Schema.Types.ObjectId, ref: 'Worksheet' },
    student_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    classroom_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    grade: { type: Number },
    time_to_complete: { type: Number }
}, { timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;