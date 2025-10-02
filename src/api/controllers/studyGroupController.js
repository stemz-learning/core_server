const StudyGroup = require('../models/studyGroupModel');
const Classroom = require('../models/classroomModel');
const User = require('../models/userModel');

class StudyGroupController {
  static async createStudyGroup(req, res) {
    try {
      const { classroomId, name, memberUserIds } = req.body;

      if (!classroomId || !Array.isArray(memberUserIds) || memberUserIds.length === 0) {
        return res.status(400).json({ message: 'classroomId and non-empty memberUserIds are required' });
      }

      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }

      // Ensure all users exist
      const users = await User.find({ _id: { $in: memberUserIds } });
      if (users.length !== memberUserIds.length) {
        return res.status(400).json({ message: 'One or more user IDs are invalid' });
      }

      // Ensure all members belong to the classroom (if classroom has student_user_ids)
      if (classroom.student_user_ids && classroom.student_user_ids.length > 0) {
        const classroomUserIds = new Set(classroom.student_user_ids.map((id) => String(id)).concat(String(classroom.teacher_user_id)));
        const allInClassroom = memberUserIds.every((id) => classroomUserIds.has(String(id)));
        if (!allInClassroom) {
          return res.status(400).json({ message: 'All members must belong to the classroom' });
        }
      }

      const createdBy = req.user?.id || memberUserIds[0];
      const studyGroup = new StudyGroup({ classroomId, name, memberUserIds, createdBy });
      const saved = await studyGroup.save();
      return res.status(201).json(saved);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create study group', error: error.message });
    }
  }

  static async getStudyGroupById(req, res) {
    try {
      const { id } = req.params;
      const group = await StudyGroup.findById(id).populate('memberUserIds', 'name email role');
      if (!group) return res.status(404).json({ message: 'Study group not found' });
      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve study group', error: error.message });
    }
  }

  static async getStudyGroupsByClassroom(req, res) {
    try {
      const { classroomId } = req.params;
      const groups = await StudyGroup.find({ classroomId, isArchived: false }).sort({ updatedAt: -1 });
      return res.status(200).json(groups);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve study groups', error: error.message });
    }
  }

  static async getUserStudyGroups(req, res) {
    try {
      const userId = req.user?.id || req.params.userId;
      const groups = await StudyGroup.find({ memberUserIds: userId, isArchived: false }).sort({ updatedAt: -1 });
      return res.status(200).json(groups);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve user study groups', error: error.message });
    }
  }

  static async updateMembers(req, res) {
    try {
      const { id } = req.params;
      const { memberUserIds } = req.body;
      if (!Array.isArray(memberUserIds)) {
        return res.status(400).json({ message: 'memberUserIds must be an array' });
      }
      const group = await StudyGroup.findById(id);
      if (!group) return res.status(404).json({ message: 'Study group not found' });

      // Optional: Ensure all users exist
      const users = await User.find({ _id: { $in: memberUserIds } });
      if (users.length !== memberUserIds.length) {
        return res.status(400).json({ message: 'One or more user IDs are invalid' });
      }

      group.memberUserIds = memberUserIds;
      await group.save();
      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update members', error: error.message });
    }
  }

  static async addMembers(req, res) {
    try {
      const { id } = req.params;
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'userIds must be a non-empty array' });
      }
      const group = await StudyGroup.findById(id);
      if (!group) return res.status(404).json({ message: 'Study group not found' });
      const set = new Set(group.memberUserIds.map((x) => String(x)));
      userIds.forEach((u) => set.add(String(u)));
      group.memberUserIds = Array.from(set);
      await group.save();
      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to add members', error: error.message });
    }
  }

  static async removeMembers(req, res) {
    try {
      const { id } = req.params;
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'userIds must be a non-empty array' });
      }
      const group = await StudyGroup.findById(id);
      if (!group) return res.status(404).json({ message: 'Study group not found' });
      const remove = new Set(userIds.map((x) => String(x)));
      group.memberUserIds = group.memberUserIds.filter((x) => !remove.has(String(x)));
      await group.save();
      return res.status(200).json(group);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to remove members', error: error.message });
    }
  }

  static async archiveStudyGroup(req, res) {
    try {
      const { id } = req.params;
      const archived = await StudyGroup.findByIdAndUpdate(id, { isArchived: true }, { new: true });
      if (!archived) return res.status(404).json({ message: 'Study group not found' });
      return res.status(200).json(archived);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to archive study group', error: error.message });
    }
  }
}

module.exports = StudyGroupController;


