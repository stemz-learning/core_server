const QuizQuestion = require('../models/quizQuestionSchema');

async function getQuizQuestions(req, res) {
  try {
    const { course_id, grade } = req.query;

    if (!course_id || !grade) {
      return res.status(400).json({ error: 'Missing required query parameters.' });
    }

    console.log(`Searching for course: ${course_id}, grade: ${grade}`);  // Debugging log

    // Normalize the grade to upper case (this will handle "K" vs "k")
    const gradeStr = grade.toUpperCase();

    console.log(`Searching for grade range: ${gradeStr}`); // Debugging log

    // Use $elemMatch to check for gradeStr in the gradeRange array
    const questions = await QuizQuestion.find({
      course_id: course_id.toLowerCase(),
      gradeRange: { $elemMatch: { $eq: gradeStr } },
    });

    console.log(`Found questions: ${questions.length}`); // Debugging log

    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getQuizQuestions };