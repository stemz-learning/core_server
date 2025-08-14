const StudentResponse = require('../models/studentResponseSchema');

// get all student responses
const getStudentResponses = async (req, res) => {
    try {
      const studentId = req.user.id;
      const { courseId } = req.params;
  
      let responseDoc = await StudentResponse.findOne({ studentId, courseId });
  
      if (!responseDoc) {
        return res.status(404).json({ message: 'No response data found for this course' });
      }
  
      return res.status(200).json(responseDoc);
    } catch (error) {
      console.error('Error fetching student responses:', error);
      return res.status(500).json({ message: 'Failed to fetch student responses', error: error.message });
    }
  };

// adding a bpq response
const addOrUpdateBPQResponse = async (req, res) => {
    try {
      const studentId = req.user.id;
      const { courseId, lessonId } = req.params;
      const newBPQ = req.body;
  
      let record = await StudentResponse.findOne({ studentId, courseId });
  
      if (!record) {
        record = new StudentResponse({ studentId, courseId, responses: [] });
      }
  
      let lesson = record.responses.find(r => r.lessonId === lessonId);
  
      if (!lesson) {
        lesson = { lessonId, bpqResponses: [newBPQ], quiz: [], worksheet: {} };
        record.responses.push(lesson);
      } else {
        // Overwrite if the same questionId exists
        const existingIndex = lesson.bpqResponses.findIndex(r => r.questionId === newBPQ.questionId);
        if (existingIndex !== -1) {
          lesson.bpqResponses[existingIndex] = newBPQ;
        } else {
          lesson.bpqResponses.push(newBPQ);
        }
      }
  
      record.updatedAt = new Date();
      await record.save();
      return res.status(200).json({ success: true, message: 'BPQ response saved' });
    } catch (error) {
      console.error('Error saving BPQ response:', error);
      return res.status(500).json({ message: 'Failed to save BPQ response', error: error.message });
    }
  };


// submitting worksheet
const submitWorksheet = async (req, res) => {
    try {
      const studentId = req.user.id;
      const { courseId, lessonId } = req.params;
      const worksheetData = req.body; // includes worksheetId, answers, attemptNumber, score, feedback
  
      let record = await StudentResponse.findOne({ studentId, courseId });
      if (!record) {
        record = new StudentResponse({ studentId, courseId, responses: [] });
      }
  
      let lesson = record.responses.find(r => r.lessonId === lessonId);
      if (!lesson) {
        lesson = { lessonId, quiz: [], bpqResponses: [], worksheet: worksheetData };
        record.responses.push(lesson);
      } else {
        lesson.worksheet = worksheetData;
      }
  
      record.updatedAt = new Date();
      await record.save();
  
      return res.status(200).json({ success: true, message: 'Worksheet submitted successfully' });
    } catch (error) {
      console.error('Error submitting worksheet:', error);
      return res.status(500).json({ message: 'Failed to submit worksheet', error: error.message });
    }
  };


// submitting quiz
const submitQuizAttempt = async (req, res) => {
    try {
      const studentId = req.user.id;
      const { courseId, lessonId } = req.params;
      const newAttempt = req.body; // includes attemptNumber, answers[], score, total
  
      let record = await StudentResponse.findOne({ studentId, courseId });
      if (!record) {
        record = new StudentResponse({ studentId, courseId, responses: [] });
      }
  
      let lesson = record.responses.find(r => r.lessonId === lessonId);
      if (!lesson) {
        lesson = { lessonId, quiz: [newAttempt], bpqResponses: [], worksheet: {} };
        record.responses.push(lesson);
      } else {
        lesson.quiz.push(newAttempt);
      }
  
      record.updatedAt = new Date();
      await record.save();
  
      return res.status(200).json({ success: true, message: 'Quiz attempt recorded' });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
    }
  };

  const getStudentResponsesByStudentId = async (req, res) => {
    try {
        const studentResponse = await StudentResponse
            .findOne({ studentId: req.params.studentId })
            .sort({ updatedAt: -1 });
        
        res.json(studentResponse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
};
  


module.exports = {
    getStudentResponses,
    addOrUpdateBPQResponse,
    submitWorksheet,
    submitQuizAttempt,
    getStudentResponsesByStudentId
  };