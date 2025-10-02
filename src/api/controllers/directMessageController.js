const DirectMessage = require('../models/directMessageModel');

class DirectMessageController {
    static async createDirectMessage(req, res) {
        const { senderId, receiverId, message } = req.body;
        const newDirectMessage = new DirectMessage({ senderId, receiverId, message });
        const result = await newDirectMessage.save();
        if (!result) {
            return res.status(400).json({ message: 'Failed to create direct message' });
        }
        res.status(201).json(result);
    }
}