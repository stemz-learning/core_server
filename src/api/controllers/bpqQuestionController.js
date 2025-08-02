const BpqQuestion = require('../models/bpqQuestionSchema');

async function getBpqQuestions(req, res) {
  try {
    const { course_id, grade, lesson_id } = req.query;

    if (!course_id || !grade || !lesson_id) {
      return res.status(400).json({ error: 'Missing required query parameters.' });
    }

    // Find all questions matching course_id, lesson_id, and grade in gradeLevels array
    const questions = await BpqQuestion.find({
      course_id: course_id.toLowerCase(),
      lesson_id,
      gradeLevels: grade,
    });

    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getBpqQuestions };
