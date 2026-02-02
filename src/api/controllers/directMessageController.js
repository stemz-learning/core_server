const DirectMessage = require('../models/DirectMessage');

class DirectMessageController {
  /**
   * Get direct messages between two users
   * Query params: userId, otherUserId, limit (optional)
   */
  static async getDirectMessages(req, res) {
    try {
      const { userId, otherUserId, limit } = req.query;
      
      if (!userId || !otherUserId) {
        return res.status(400).json({ message: 'userId and otherUserId are required' });
      }

      const query = {
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      };

      let messagesQuery = DirectMessage.find(query).sort({ createdAt: 1 });
      
      if (limit) {
        messagesQuery = messagesQuery.limit(parseInt(limit, 10));
      }

      const messages = await messagesQuery
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email');
      
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve direct messages', error: error.message });
    }
  }

  /**
   * Create/send a direct message
   */
  static async createDirectMessage(req, res) {
    try {
      const { senderId, receiverId, message } = req.body;
      
      // Use authenticated user ID if available
      const actualSenderId = req.user?.id || senderId;
      
      if (!actualSenderId || !receiverId || !message) {
        return res.status(400).json({ message: 'senderId, receiverId, and message are required' });
      }

      const newDirectMessage = new DirectMessage({ 
        senderId: actualSenderId, 
        receiverId, 
        message 
      });
      
      const result = await newDirectMessage.save();
      
      if (!result) {
        return res.status(400).json({ message: 'Failed to create direct message' });
      }
      
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create direct message', error: error.message });
    }
  }

  /**
   * Get all conversations for a user (distinct other users)
   */
  static async getUserConversations(req, res) {
    try {
      const userId = req.user?.id || req.params.userId;
      
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }

      // Get all messages where user is sender or receiver
      const messages = await DirectMessage.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      })
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email')
        .sort({ createdAt: -1 });

      // Group by conversation partner
      const conversationsMap = new Map();
      
      messages.forEach((msg) => {
        const otherUserId = String(msg.senderId._id) === String(userId) 
          ? String(msg.receiverId._id) 
          : String(msg.senderId._id);
        
        if (!conversationsMap.has(otherUserId)) {
          const otherUser = String(msg.senderId._id) === String(userId) 
            ? msg.receiverId 
            : msg.senderId;
          
          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            user: otherUser,
            lastMessage: msg.message,
            lastMessageAt: msg.createdAt,
          });
        }
      });

      const conversations = Array.from(conversationsMap.values());
      return res.status(200).json(conversations);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve conversations', error: error.message });
    }
  }
}

module.exports = DirectMessageController;
