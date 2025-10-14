const express = require('express');
const StudyGroupController = require('../controllers/studyGroupController');
const { authenticateToken } = require('../controllers/authController');

const router = express.Router();

// Create a study group
router.post('/', authenticateToken, StudyGroupController.createStudyGroup);

// Get a study group by id
router.get('/:id', authenticateToken, StudyGroupController.getStudyGroupById);

// Get study groups by classroom id
router.get('/classroom/:classroomId', authenticateToken, StudyGroupController.getStudyGroupsByClassroom);

// Get current user's study groups
router.get('/', authenticateToken, StudyGroupController.getUserStudyGroups);

// Replace members
router.put('/:id/members', authenticateToken, StudyGroupController.updateMembers);

// Add members
router.post('/:id/members', authenticateToken, StudyGroupController.addMembers);

// Remove members
router.delete('/:id/members', authenticateToken, StudyGroupController.removeMembers);

// Archive group
router.post('/:id/archive', authenticateToken, StudyGroupController.archiveStudyGroup);

module.exports = router;
