const express = require('express');
const { 
  createWSProgress, 
  getWSProgress,
  updateWSProgress,
  getWorksheetsByCourseId,
  getAllWorksheets,
  getWorksheetsByClassroomId
} = require('../controllers/worksheetController');


const router = express.Router();

// Route to create a new worksheet progress
router.post('/create', createWSProgress);

router.get('/course/:courseId', getWorksheetsByCourseId);
// Route to get all worksheets
router.get('/', getAllWorksheets);

// Route to get a single worksheet progress by email and worksheetId
router.get('/get/email/:email/worksheetId/:worksheetId', getWSProgress); 

// Route to update a worksheet progress by email and worksheetId
router.put('/update', updateWSProgress);

// Route to get all worksheets by classroomId
router.get('/classroom/:classroomId', getWorksheetsByClassroomId);

module.exports = router;