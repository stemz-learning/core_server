const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);

module.exports = DirectMessage;