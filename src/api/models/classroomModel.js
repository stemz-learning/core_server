const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    classroom_id: { type: String, required: true , unique: true},
    classroom_name: {type: String },
    teacher_user_id: { type: String, required: true },
    student_user_ids: { type: String }
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
