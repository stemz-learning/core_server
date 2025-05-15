const Worksheet = require('../models/worksheetModel');
const Classroom = require('../models/classroomModel');

// Get progress by userEmail and worksheet id
const getWSProgress = async (req, res) => {
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
};

// Get all worksheets by courseId
const getWorksheetsByCourseId = async (req, res) => {
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
};
// Get all worksheets
const getAllWorksheets = async (req, res) => {
  try {
    const worksheets = await Worksheet.find();
    if (!worksheets || worksheets.length === 0) {
      return res.status(404).json({ message: 'No worksheets found' });
    }

    res.status(200).json(worksheets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve worksheets', error: error.message });
  }
};

const getWorksheetsByClassroomId = async (req, res) => {
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
};

// Create a new worksheet
const createWSProgress = async (req, res) => {
  try {
    // Validate required fields
    const { name, course_id, description } = req.body;
    if (!name || !course_id || !description) {
      return res.status(400).json({ message: 'Name, course_id, and description are required' });
    }

    // Create a new worksheet document
    const newWorksheet = new Worksheet({ name, course_id, description });
    await newWorksheet.save();

    // Respond with the created worksheet
    res.status(201).json(newWorksheet);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create worksheet', error: error.message });
  }
};

// Update a progress by userEmail and worksheetId
const updateWSProgress = async (req, res) => {
  try {
    if (!req.body.userEmail || !req.body.worksheetId || !req.body.progress) {
      return res.status(400).json({ message: 'Email, worksheetId and progress are required' });
    }
    const updatedProgress = await Worksheet.findOneAndUpdate({ userEmail: req.body.userEmail, worksheetId: req.body.worksheetId }, req.body, { new: true });




    if (!updatedProgress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    res.status(200).json(updatedProgress);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
};

module.exports = {
  getWSProgress,
  createWSProgress,
  updateWSProgress,
  getWorksheetsByCourseId,
  getAllWorksheets,
  getWorksheetsByClassroomId
};

