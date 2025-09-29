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
// const addOrUpdateBPQResponse = async (req, res) => {
//     try {
//       const studentId = req.user.id;
//       const { courseId, lessonId } = req.params;
//       const newBPQ = req.body;
  
//       let record = await StudentResponse.findOne({ studentId, courseId });
  
//       if (!record) {
//         record = new StudentResponse({ studentId, courseId, responses: [] });
//       }
  
//       let lesson = record.responses.find(r => r.lessonId === lessonId);
  
//       if (!lesson) {
//         lesson = { lessonId, bpqResponses: [newBPQ], quiz: [], worksheet: {} };
//         record.responses.push(lesson);
//       } else {
//         // Overwrite if the same questionId exists
//         const existingIndex = lesson.bpqResponses.findIndex(r => r.questionId === newBPQ.questionId);
//         if (existingIndex !== -1) {
//           lesson.bpqResponses[existingIndex] = newBPQ;
//         } else {
//           lesson.bpqResponses.push(newBPQ);
//         }
//       }
  
//       record.updatedAt = new Date();
//       await record.save();
//       return res.status(200).json({ success: true, message: 'BPQ response saved' });
//     } catch (error) {
//       console.error('Error saving BPQ response:', error);
//       return res.status(500).json({ message: 'Failed to save BPQ response', error: error.message });
//     }
//   };


const addOrUpdateBPQResponse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, lessonId } = req.params;
    const { questionId, finalAnswer, feedback, scores, events } = req.body;

    let record = await StudentResponse.findOne({ studentId, courseId });
    if (!record) record = new StudentResponse({ studentId, courseId, responses: [] });

    let lesson = record.responses.find(r => r.lessonId === lessonId);
    if (!lesson) {
      lesson = { lessonId, bpqResponses: [], quiz: [], worksheet: {} };
      record.responses.push(lesson);
    }

    const existingIndex = lesson.bpqResponses.findIndex(r => r.questionId === questionId);

    if (existingIndex !== -1) {
      // Update finalAnswer, feedback, scores
      lesson.bpqResponses[existingIndex].finalAnswer = finalAnswer;
      lesson.bpqResponses[existingIndex].feedback = feedback;
      lesson.bpqResponses[existingIndex].scores = scores;

      // Append new events to existing lifecycle
      lesson.bpqResponses[existingIndex].events = [
        ...(lesson.bpqResponses[existingIndex].events || []),
        ...(events || [])
      ];
    } else {
      lesson.bpqResponses.push({ questionId, finalAnswer, feedback, scores, events: events || [] });
    }

    record.updatedAt = new Date();
    await record.save();
    return res.status(200).json({ success: true, message: 'BPQ response saved' });
  } catch (error) {
    console.error('Error saving BPQ response:', error);
    return res.status(500).json({ message: 'Failed to save BPQ response', error: error.message });
  }
};

const addBPQEvent = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;
    const { questionId, eventType, value, cursorPos } = req.body;

    let record = await StudentResponse.findOne({ studentId, courseId });
    if (!record) {
      record = new StudentResponse({ studentId, courseId, responses: [] });
    }

    let lesson = record.responses.find(r => r.lessonId === lessonId);
    if (!lesson) {
      lesson = { lessonId, bpqResponses: [], quiz: [], worksheet: {} };
      record.responses.push(lesson);
    }

    let response = lesson.bpqResponses.find(r => r.questionId === questionId);
    if (!response) {
      response = { questionId, initialAnswer: value, finalAnswer: "", events: [] };
      lesson.bpqResponses.push(response);
    }

    // Push the lifecycle event
    response.events.push({ eventType, value, cursorPos, timestamp: new Date() });

    // On submit, also update finalAnswer
    if (eventType === "submit") {
      response.finalAnswer = value;
    }

    record.updatedAt = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: "Event recorded" });
  } catch (error) {
    console.error("Error saving BPQ event:", error);
    return res.status(500).json({ message: "Failed to save BPQ event", error: error.message });
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
// const submitQuizAttempt = async (req, res) => {
//     try {
//       const studentId = req.user.id;
//       const { courseId, lessonId } = req.params;
//       const newAttempt = req.body; // includes attemptNumber, answers[], score, total
  
//       let record = await StudentResponse.findOne({ studentId, courseId });
//       if (!record) {
//         record = new StudentResponse({ studentId, courseId, responses: [] });
//       }
  
//       let lesson = record.responses.find(r => r.lessonId === lessonId);
//       if (!lesson) {
//         lesson = { lessonId, quiz: [newAttempt], bpqResponses: [], worksheet: {} };
//         record.responses.push(lesson);
//       } else {
//         lesson.quiz.push(newAttempt);
//       }
  
//       record.updatedAt = new Date();
//       await record.save();
  
//       return res.status(200).json({ success: true, message: 'Quiz attempt recorded' });
//     } catch (error) {
//       console.error('Error submitting quiz:', error);
//       return res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
//     }
//   };

const submitQuizAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, lessonId } = req.params;
    const newAttempt = req.body; // { attemptNumber, answers[], score, total }

    let record = await StudentResponse.findOne({ studentId, courseId });
    if (!record) record = new StudentResponse({ studentId, courseId, responses: [] });

    let lesson = record.responses.find(r => r.lessonId === lessonId);
    if (!lesson) {
      lesson = { lessonId, quiz: [], bpqResponses: [], worksheet: {} };
      record.responses.push(lesson);
    }

    // Ensure each answer has its own lifecycle (events array)
    newAttempt.answers = newAttempt.answers.map(a => ({
      ...a,
      events: a.events || []   // don’t merge across attempts, keep events local
    }));

    // Push the entire attempt (independent lifecycle)
    lesson.quiz.push(newAttempt);

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


// record a partial quiz answer (lifecycle events)
const savePartialQuizAnswer = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, lessonId } = req.params;
    const { questionId, selectedAnswer, eventType, cursorPos } = req.body;

    // Find the student's record
    let record = await StudentResponse.findOne({ studentId, courseId });
    if (!record) {
      record = new StudentResponse({ studentId, courseId, responses: [] });
    }

    // Find the lesson
    let lesson = record.responses.find(r => r.lessonId === lessonId);
    if (!lesson) {
      lesson = { lessonId, quiz: [], bpqResponses: [], worksheet: {} };
      record.responses.push(lesson);
    }

    // Find the quiz answer object
    let answer = lesson.quiz.find(a => a.questionId === questionId);

    if (!answer) {
      // If it doesn't exist yet, create it
      answer = { questionId, selectedAnswer, correct: false, events: [] };
      lesson.quiz.push(answer);
    } else {
      // Update the current selected answer
      answer.selectedAnswer = selectedAnswer;
    }

    // Push the lifecycle event
    answer.events.push({
      timestamp: new Date(),
      eventType,
      value: selectedAnswer,
      cursorPos: cursorPos || null
    });

    record.updatedAt = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: "Partial quiz answer recorded" });
  } catch (error) {
    console.error("Error saving partial quiz answer:", error);
    return res.status(500).json({ message: "Failed to save partial quiz answer", error: error.message });
  }
};

  


module.exports = {
    getStudentResponses,
    addOrUpdateBPQResponse,
    submitWorksheet,
    submitQuizAttempt,
    getStudentResponsesByStudentId,
    addBPQEvent,
    savePartialQuizAnswer
  };