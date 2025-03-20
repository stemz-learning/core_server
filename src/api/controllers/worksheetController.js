const Worksheet = require('../models/worksheetModel');


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

// Create a new user
const createWSProgress = async (req, res) => {
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
};

