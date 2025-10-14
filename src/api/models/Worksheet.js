const mongoose = require('mongoose');

// Define the user schema
const worksheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course_id: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

// Create the worksheet model
const Worksheet = mongoose.model('Worksheet', worksheetSchema);

// Export the model
module.exports = Worksheet;
