const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function loadJSON(baseDir, fileName, res) {
  const filePath = path.join(__dirname, '..', baseDir, fileName);

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return res.json(parsed);
  } catch (err) {
    return res.status(404).json({ error: 'File not found or invalid' });
  }
}

// GET /api/questions/bpq?topic=astronomy&gradeRange=k-2
router.get('/questions/bpq', (req, res) => {
  const { topic, gradeRange } = req.query;

  if (!topic || !gradeRange) {
    return res.status(400).json({ error: 'Missing topic or gradeRange' });
  }

  const fileName = `${topic.toLowerCase()}-${gradeRange.toLowerCase()}.json`;
  return loadJSON('bpqQuestions', fileName, res);
});

// GET /api/questions/quiz?topic=astronomy&gradeRange=k-2
router.get('/questions/quiz', (req, res) => {
  const { topic, gradeRange } = req.query;

  if (!topic || !gradeRange) {
    return res.status(400).json({ error: 'Missing topic or gradeRange' });
  }

  const fileName = `${topic.toLowerCase()}-${gradeRange.toLowerCase()}.json`;
  return loadJSON('quizQuestions', fileName, res);
});

module.exports = router;
