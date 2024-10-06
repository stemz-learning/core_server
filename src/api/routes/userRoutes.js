const express = require('express');
const { createUser, getUser, updateUser, deleteUser, getAllUsers } = require('../controllers/userController');
const { User } = require('../models/userModel');
const router = express.Router();

router.post('/create', createUser);
router.get('/', getAllUsers);
router.get('/read/:id', getUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

router.get('/test-connection', async (req, res) => {
    try {
        const users = await User.find(); // Assuming you have a User model
        res.status(200).json({ message: 'Database connection successful', users });
    } catch (error) {
        res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
});


module.exports = router;
