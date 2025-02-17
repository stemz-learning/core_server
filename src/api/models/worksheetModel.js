const mongoose = require('mongoose');

// Define the user schema
const worksheetSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    worksheetId: { type: String, required: true },
    progress: { type: Object, required: true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});



// Create the worksheet model
const Worksheet = mongoose.model('Worksheet', worksheetSchema);


// Export the model
module.exports = Worksheet;
