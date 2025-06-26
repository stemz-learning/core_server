const express = require('express');
const worksheetController = require('../controllers/worksheetController');


const router = express.Router();

// Route to create a new worksheet progress
router.post('/create', worksheetController.createWSProgress);

router.get('/course/:courseId', worksheetController.getWorksheetsByCourseId);
// Route to get all worksheets
router.get('/', worksheetController.getAllWorksheets);

// Route to get a single worksheet progress by email and worksheetId
router.get('/get/email/:email/worksheetId/:worksheetId', worksheetController.getWSProgress); 

// Route to update a worksheet progress by email and worksheetId
router.put('/update', worksheetController.updateWSProgress);

// Route to get all worksheets by classroomId
router.get('/classroom/:classroomId', worksheetController.getWorksheetsByClassroomId);

module.exports = router;