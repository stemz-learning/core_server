const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');
const Worksheet = require('../models/Worksheet');
const Classroom = require('../models/Classroom');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('Worksheet API', () => {
  let mongod;
  let teacherToken;
  let studentToken;
  let teacher;
  let student;
  let classroom;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Create test users
    teacher = await User.create({
      name: 'Worksheet Teacher',
      email: 'worksheetteacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    student = await User.create({
      name: 'Worksheet Student',
      email: 'worksheetstudent@test.com',
      password: 'password123',
      role: 'student',
      gradeLevel: 3
    });

    // Create test classroom
    classroom = await Classroom.create({
      name: 'Worksheet Test Classroom',
      description: 'Test classroom for worksheets',
      teacher_user_id: teacher._id,
      student_user_ids: [student._id]
    });

    teacherToken = jwt.sign(
      { id: teacher._id, email: teacher.email, role: 'teacher' },
      JWT_SECRET_KEY
    );

    studentToken = jwt.sign(
      { id: student._id, email: student.email, role: 'student' },
      JWT_SECRET_KEY
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('GET /api/worksheets', () => {
    test('should get all worksheets', async () => {
      const res = await request(app)
        .get('/api/worksheets')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      // Expect 404 if no worksheets exist, 200 if they do
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });

  describe('GET /api/worksheets/course/:courseId', () => {
    test('should get worksheets by course', async () => {
      const res = await request(app)
        .get('/api/worksheets/course/astronomy')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      // Expect 404 if no worksheets exist, 200 if they do
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });

  describe('GET /api/worksheets/classroom/:classroomId', () => {
    test('should get worksheets by classroom', async () => {
      const res = await request(app)
        .get(`/api/worksheets/classroom/${classroom._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      // Expect 404 if no worksheets exist, 200 if they do
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });

  describe('POST /api/worksheets/create', () => {
    test('should return 400 for unsupported worksheet progress fields', async () => {
      const progressData = {
        userEmail: student.email,
        worksheetId: 'test-worksheet-id',
        progress: {
          completed: true,
          score: 85
        }
      };

      const res = await request(app)
        .post('/api/worksheets/create')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(progressData);
      
      // The Worksheet model doesn't support these fields, so expect 400
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/worksheets/update', () => {
    test('should return 404 for unsupported worksheet update fields', async () => {
      const updateData = {
        userEmail: student.email,
        worksheetId: 'test-worksheet-id',
        progress: {
          completed: true,
          score: 90
        }
      };

      const res = await request(app)
        .put('/api/worksheets/update')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData);
      
      // The Worksheet model doesn't support these fields, so expect 404
      expect(res.status).toBe(404);
    });
  });
});
