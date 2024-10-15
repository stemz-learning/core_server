const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true, maxLength: 100 }, // Added maxLength
    description: { type: String, required: true },
    teacher_user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Assuming 'User' is the user model
    student_user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Assuming 'User' is the user model
}, { timestamps: true }); // Enables createdAt and updatedAt fields

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
