const GroupMessage = require('../models/groupMessageModel');
const StudyGroup = require('../models/studyGroupModel');

class GroupMessageController {
  static async getMessagesByGroup(req, res) {
    try {
      const { groupId } = req.params;
      const group = await StudyGroup.findById(groupId);
      if (!group) return res.status(404).json({ message: 'Study group not found' });

      const messages = await GroupMessage.find({ groupId, deletedAt: null }).sort({ createdAt: 1 });
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve messages', error: error.message });
    }
  }

  static async postMessage(req, res) {
    try {
      const { groupId } = req.params;
      const { content, attachments } = req.body;
      const senderUserId = req.user?.id;
      if (!senderUserId) return res.status(401).json({ message: 'Unauthorized' });
      if (!content && (!attachments || attachments.length === 0)) {
        return res.status(400).json({ message: 'Message content or attachments are required' });
      }

      const group = await StudyGroup.findById(groupId);
      if (!group) return res.status(404).json({ message: 'Study group not found' });

      // Ensure sender is a member
      const isMember = group.memberUserIds.some((id) => String(id) === String(senderUserId));
      if (!isMember) return res.status(403).json({ message: 'User is not a member of this study group' });

      const message = new GroupMessage({ groupId, senderUserId, content, attachments });
      const saved = await message.save();

      // Update group's lastMessageAt for sorting purposes
      group.lastMessageAt = saved.createdAt;
      await group.save();

      return res.status(201).json(saved);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to post message', error: error.message });
    }
  }

  static async editMessage(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;
      const msg = await GroupMessage.findById(id);
      if (!msg) return res.status(404).json({ message: 'Message not found' });
      if (String(msg.senderUserId) !== String(userId)) {
        return res.status(403).json({ message: 'Cannot edit others\' messages' });
      }
      msg.content = content ?? msg.content;
      msg.editedAt = new Date();
      await msg.save();
      return res.status(200).json(msg);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to edit message', error: error.message });
    }
  }

  static async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const msg = await GroupMessage.findById(id);
      if (!msg) return res.status(404).json({ message: 'Message not found' });
      if (String(msg.senderUserId) !== String(userId)) {
        return res.status(403).json({ message: 'Cannot delete others\' messages' });
      }
      msg.deletedAt = new Date();
      await msg.save();
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete message', error: error.message });
    }
  }
}

module.exports = GroupMessageController;


