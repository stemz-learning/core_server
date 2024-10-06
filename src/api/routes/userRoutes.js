const express = require('express');
const { createUser, getUser, updateUser, deleteUser, getAllUsers } = require('../controllers/userController');
const router = express.Router();

router.post('/create', createUser);
router.get('/', getAllUsers);
router.get('/read/:id', getUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;
