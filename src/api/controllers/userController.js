// src/controllers/userController.js
const User = require('../models/userModel');
const connectDB = require('../mongodb');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    await connectDB();
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

// Get a single user by ID
const getUser = async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    await connectDB();
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create user', error });
  }
};

// Update a user by ID
const updateUser = async (req, res) => {
  try {
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    await connectDB();
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
