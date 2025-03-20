const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true },
    teacher_user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    student_user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    schedule: { type: String, required: false }, // New field
    recommendedGradeLevel: { type: String, required: false } // New field
}, { timestamps: true });

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;