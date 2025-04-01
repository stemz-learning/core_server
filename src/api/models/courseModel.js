const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    id: {type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema)

module.exports = Course;