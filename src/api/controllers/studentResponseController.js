const StudentResponse = require('../models/StudentResponse');

// get all student responses
const getStudentResponses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const responseDoc = await StudentResponse.findOne({ studentId, courseId });

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

    let lesson = record.responses.find((r) => r.lessonId === lessonId);

    if (!lesson) {
      lesson = {
        lessonId, bpqResponses: [newBPQ], quiz: [], worksheet: {},
      };
      record.responses.push(lesson);
    } else {
      // Overwrite if the same questionId exists
      const existingIndex = lesson.bpqResponses.findIndex((r) => r.questionId === newBPQ.questionId);
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

    let lesson = record.responses.find((r) => r.lessonId === lessonId);
    if (!lesson) {
      lesson = {
        lessonId, quiz: [], bpqResponses: [], worksheet: worksheetData,
      };
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

// const savePartialQuizAnswer = async (req, res) => {
//   try {
//     console.log("REQ.USER:", req.user);
//     const studentId = req.user.id;
//     const { courseId, lessonId } = req.params;
//     const { answers } = req.body;
//     console.log("ANSWERS RECEIVED:", answers);

//     if (!answers || !Array.isArray(answers)) {
//       return res.status(400).json({ message: "Answers array is required" });
//     }

//     // Find or create the student's record
//     let record = await StudentResponse.findOne({ studentId, courseId });
//     if (!record) {
//       record = new StudentResponse({ studentId, courseId, responses: [] });
//     }

//     // Find or create the lesson entry
//     let lesson = record.responses.find(r => r.lessonId === lessonId);
//     if (!lesson) {
//       lesson = { lessonId, quiz: [], bpqResponses: [], worksheet: {} };
//       record.responses.push(lesson);
//     }

//     // Get the latest partial attempt or create a new one
//     let latestAttempt = lesson.quiz[lesson.quiz.length - 1];
//     if (!latestAttempt || latestAttempt.submittedAt) {
//       // No ongoing attempt or previous attempt already submitted
//       latestAttempt = {
//         attemptNumber: lesson.quiz.length + 1,
//         answers: [],
//         score: null,
//         total: null,
//         submittedAt: null, // will be set on final submission
//       };
//       lesson.quiz.push(latestAttempt);
//     }

//     // Loop through answers and add/update in the latest attempt
//     for (const ans of answers) {
//       if (!ans.questionId || ans.selectedAnswer == null) {
//         console.warn("Skipping invalid answer:", ans);
//         continue;
//       }

//       let answerObj = latestAttempt.answers.find(a => a.questionId === ans.questionId);
//       if (!answerObj) {
//         answerObj = {
//           questionId: ans.questionId,
//           selectedAnswer: ans.selectedAnswer,
//           correct: false,
//           events: [],
//         };
//         latestAttempt.answers.push(answerObj);
//       } else {
//         answerObj.selectedAnswer = ans.selectedAnswer;
//       }

//       // Add partial-save event
//       answerObj.events.push({
//         timestamp: new Date(),
//         eventType: "partial-save",
//         value: ans.selectedAnswer,
//         cursorPos: ans.cursorPos || null,
//       });
//     }

//     record.updatedAt = new Date();

//     try {
//       await record.save();
//       console.log("✅ Partial quiz answers saved successfully");
//     } catch (saveErr) {
//       console.error("❌ SAVE ERROR:", saveErr);
//       throw saveErr;
//     }

//     return res.status(200).json({ success: true, message: "Partial quiz answers recorded" });
//   } catch (error) {
//     console.error("❌ Error saving partial quiz answer:", error);
//     return res.status(500).json({ message: "Failed to save partial quiz answer", error: error.message });
//   }
// };

const savePartialQuizAnswer = async (req, res) => {
  console.log("📩 Incoming partial quiz request...");
  console.log("BODY:", req.body);
  console.log("PARAMS:", req.params);
  console.log("USER:", req.user);

  try {
    // --- Validate user ---
    if (!req.user || !req.user.id) {
      console.error("❌ Missing req.user or req.user.id");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const studentId = req.user.id;
    const { courseId, lessonId } = req.params;
    const { answers } = req.body;

    // --- Validate input ---
    if (!answers || !Array.isArray(answers)) {
      console.error("❌ Invalid 'answers' payload:", answers);
      return res.status(400).json({ message: "Answers array is required" });
    }

    console.log("✅ ANSWERS RECEIVED:", answers);

    // --- Fetch or create student record ---
    let record = await StudentResponse.findOne({ studentId, courseId });
    if (!record) {
      console.log("🆕 Creating new StudentResponse record...");
      record = new StudentResponse({ studentId, courseId, responses: [] });
    }

    // --- Find or create lesson ---
    let lesson = record.responses.find(r => r.lessonId === lessonId);
    if (!lesson) {
      console.log("🆕 Creating new lesson entry...");
      lesson = { lessonId, quiz: [], bpqResponses: [], worksheet: {} };
      record.responses.push(lesson);
    }

    // --- Find or create quiz attempt ---
    let attempt = lesson.quiz.find(a => a.attemptNumber === 1);
    if (!attempt) {
      console.log("🆕 Creating new quiz attempt...");
      attempt = { attemptNumber: 1, answers: [] };
      lesson.quiz.push(attempt);
    }

    // --- Update answers ---
    for (const ans of answers) {
      if (!ans.questionId || !ans.selectedAnswer) {
        console.warn("⚠️ Skipping invalid answer:", ans);
        continue;
      }

      let answer = attempt.answers.find(a => a.questionId === ans.questionId);
      if (!answer) {
        answer = {
          questionId: ans.questionId,
          selectedAnswer: ans.selectedAnswer,
          correct: false,
          events: []
        };
        attempt.answers.push(answer);
      } else {
        answer.selectedAnswer = ans.selectedAnswer;
      }

      answer.events.push({
        timestamp: new Date(),
        eventType: "partial-save",
        value: ans.selectedAnswer,
        cursorPos: ans.cursorPos || null
      });
    }

    record.updatedAt = new Date();

    await record.save();
    console.log("✅ Partial quiz answers saved successfully");

    return res.status(200).json({ success: true, message: "Partial quiz answers recorded" });
  } catch (error) {
    console.error("💥 ERROR in savePartialQuizAnswer:", error);
    return res.status(500).json({
      message: "Failed to save partial quiz answer",
      error: error.message,
      stack: error.stack
    });
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