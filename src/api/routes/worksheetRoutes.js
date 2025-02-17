const express = require('express');
const { 
  createWSProgress, 
  getWSProgress,
  updateWSProgress,
} = require('../controllers/worksheetController');


const router = express.Router();

// Route to create a new worksheet progress
router.post('/create', createWSProgress);

// Route to get a single worksheet progress by email and worksheetId
router.get('/get/email/:email/worksheetId/:worksheetId', getWSProgress); 

// Route to update a worksheet progress by email and worksheetId
router.put('/update', updateWSProgress);

module.exports = router;