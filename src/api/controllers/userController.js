const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
    }
  }

  // Get a single user by ID
  static async getUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve user', error: error.message });
    }
  }

  // Get a single user by email
  static async getUserByEmail(req, res) {
    try {
      const user = await User.findOne({ email: req.params.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve user by email', error: error.message });
    }
  }

  // Create a new user
  static async createUser(req, res) {
    try {
      const userData = { ...req.body };
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const newUser = new User(userData);
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create user', error: error.message });
    }
  }

  // Update a user by ID
  static async updateUser(req, res) {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  }

  // Update user grade level - NEW METHOD
  static async updateUserGrade(req, res) {
    try {
      const { id } = req.params;
      const { gradeLevel } = req.body;
      
      // Validate grade level
      if (!gradeLevel || gradeLevel < 1 || gradeLevel > 6) {
        return res.status(400).json({
          success: false,
          message: 'Grade level must be between 1 and 6'
        });
      }
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { gradeLevel: parseInt(gradeLevel) },
        { new: true, runValidators: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Grade level updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          gradeLevel: updatedUser.gradeLevel
        }
      });
      
    } catch (error) {
      console.error('Error updating user grade:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete a user by ID
  static async deleteUser(req, res) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  }
}

module.exports = UserController;