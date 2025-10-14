const Worksheet = require('../models/Worksheet');
const Classroom = require('../models/Classroom');

class WorksheetController {
  // Get all worksheets by courseId
  static async getWorksheetsByCourseId(req, res) {
    try {
      if (!req.params.courseId) {
        return res.status(400).json({ message: 'courseId is required' });
      }
      const worksheets = await Worksheet.find({ course_id: req.params.courseId });
      if (!worksheets || worksheets.length === 0) {
        return res.status(404).json({ message: 'No worksheets found for this course' });
      }
      res.status(200).json(worksheets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve worksheets', error: error.message });
    }
  }

  // Get all worksheets
  static async getAllWorksheets(req, res) {
    try {
      const worksheets = await Worksheet.find();
      if (!worksheets || worksheets.length === 0) {
        return res.status(404).json({ message: 'No worksheets found' });
      }
      res.status(200).json(worksheets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve worksheets', error: error.message });
    }
  }

  static async getWorksheetsByClassroomId(req, res) {
    try {
      if (!req.params.classroomId) {
        return res.status(400).json({ message: 'classroomId is required' });
      }
      const classroom = await Classroom.findById(req.params.classroomId);
      const courseIds = classroom.course_ids;
      if (!courseIds || courseIds.length === 0) {
        return res.status(404).json({ message: 'No courses found for this classroom' });
      }
      console.log(courseIds);

      const worksheets = await Worksheet.find({ course_id: { $in: courseIds } });
      if (!worksheets || worksheets.length === 0) {
        return res.status(404).json({ message: 'No worksheets found for the courses in this classroom' });
      }
      res.status(200).json(worksheets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve worksheets', error: error.message });
    }
  }

  // Get progress by userEmail and worksheet id
  static async getWSProgress(req, res) {
    try {
      if (!req.params.email || !req.params.worksheetId) {
        return res.status(400).json({ message: 'Email and worksheetId are required' });
      }
      const progress = await Worksheet.findOne({ userEmail: req.params.email, worksheetId: req.params.worksheetId });
      if (!progress) {
        return res.status(404).json({ message: 'Progress not found' });
      }
      res.status(200).json(progress);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve progress', error: error.message });
    }
  }

  // Create a new user
  static async createWSProgress(req, res) {
    try {
      if (!req.body.userEmail || !req.body.worksheetId || !req.body.progress) {
        return res.status(400).json({ message: 'Email, worksheetId and progress are required' });
      }
      const newProgress = new Worksheet(req.body);
      await newProgress.save();
      res.status(201).json(newProgress);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create user', error: error.message });
    }
  }

  // Update a progress by userEmail and worksheetId
  static async updateWSProgress(req, res) {
    try {
      if (!req.body.userEmail || !req.body.worksheetId || !req.body.progress) {
        return res.status(400).json({ message: 'Email, worksheetId and progress are required' });
      }
      const updatedProgress = await Worksheet.findOneAndUpdate(
        { userEmail: req.body.userEmail, worksheetId: req.body.worksheetId },
        req.body,
        { new: true },
      );
      if (!updatedProgress) {
        return res.status(404).json({ message: 'Progress not found' });
      }
      res.status(200).json(updatedProgress);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update progress', error: error.message });
    }
  }
}

module.exports = WorksheetController;
