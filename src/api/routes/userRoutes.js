const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Route to create a new user
router.post('/create', userController.createUser);

// Route to get all users
router.get('/', userController.getAllUsers);

// Route to get a single user by ID
router.get('/id/:id', userController.getUser);

// Route to get a single user by email
router.get('/email/:email', userController.getUserByEmail);

// Route to update a user by ID
router.put('/id/:id', userController.updateUser);

// Route to delete a user by ID
router.delete('/id/:id', userController.deleteUser);

// Route to update a user's grade level
router.put('/:id/grade', userController.updateUserGrade);

module.exports = router;
