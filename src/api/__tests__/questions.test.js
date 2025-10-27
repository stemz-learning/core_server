const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');
const QuizQuestion = require('../models/QuizQuestion');
const BpqQuestion = require('../models/BpqQuestion');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('Question APIs', () => {
  let mongod;
  let teacherToken;
  let teacher;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Create test user
    teacher = await User.create({
      name: 'Question Teacher',
      email: 'questionteacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    teacherToken = jwt.sign(
      { id: teacher._id, email: teacher.email, role: 'teacher' },
      JWT_SECRET_KEY
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('QuizQuestion API', () => {
    describe('GET /api/quizquestions', () => {
    test('should get quiz questions', async () => {
      const res = await request(app)
        .get('/api/quizquestions?course_id=astronomy&grade=k-2')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('questions');
      expect(Array.isArray(res.body.questions)).toBe(true);
    });

      test('should get quiz questions with topic and grade range', async () => {
        const res = await request(app)
          .get('/api/quizquestions?course_id=astronomy&grade=k-2')
          .set('Authorization', `Bearer ${teacherToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('questions');
        expect(Array.isArray(res.body.questions)).toBe(true);
      });
    });
  });

  describe('BpqQuestion API', () => {
    describe('GET /api/bpqquestions', () => {
    test('should get BPQ questions', async () => {
      const res = await request(app)
        .get('/api/bpqquestions?course_id=chemistry&grade=5-6&lesson_id=lesson1')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('questions');
      expect(Array.isArray(res.body.questions)).toBe(true);
    });

      test('should get BPQ questions with topic and grade range', async () => {
        const res = await request(app)
          .get('/api/bpqquestions?course_id=chemistry&grade=5-6&lesson_id=lesson2')
          .set('Authorization', `Bearer ${teacherToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('questions');
        expect(Array.isArray(res.body.questions)).toBe(true);
      });
    });
  });
});
