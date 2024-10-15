const express = require('express');
const { 
  createUser, 
  getUser, 
  updateUser, 
  deleteUser, 
  getAllUsers, 
  getUserByEmail  // Import the new controller function
} = require('../controllers/userController');

const router = express.Router();

// Route to create a new user
router.post('/create', createUser);

// Route to get all users
router.get('/', getAllUsers);

// Route to get a single user by ID
router.get('/id/:id', getUser); 

// Route to get a single user by email
router.get('/email/:email', getUserByEmail);

// Route to update a user by ID
router.put('/id/:id', updateUser);

// Route to delete a user by ID
router.delete('/id/:id', deleteUser);

module.exports = router;
