const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');
const Course = require('../models/Course');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('Course API', () => {
  let mongod;
  let teacherToken;
  let studentToken;
  let teacher;
  let student;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    // Create test users
    teacher = await User.create({
      name: 'Course Teacher',
      email: 'courseteacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    student = await User.create({
      name: 'Course Student',
      email: 'coursestudent@test.com',
      password: 'password123',
      role: 'student',
      gradeLevel: 3
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

  describe('GET /api/courses', () => {
    test('should get all courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('should get all courses without authentication', async () => {
      const res = await request(app)
        .get('/api/courses');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/courses', () => {
    test('should create a new course', async () => {
      const newCourse = {
        name: 'Test Course',
        description: 'A comprehensive test course',
        lesson_1: true,
        lesson_2: false,
        ws_1: true,
        quiz_1: false
      };

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(newCourse);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newCourse.name);
      expect(res.body.description).toBe(newCourse.description);
      expect(res.body.lesson_1).toBe(true);
      expect(res.body.lesson_2).toBe(false);
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteCourse = {
        name: 'Incomplete Course'
        // Missing required description field
      };

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(incompleteCourse);
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/courses/:id', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create({
        name: 'Test Course for Get',
        description: 'Test description',
        lesson_1: true,
        ws_1: true
      });
    });

    test('should get course by ID', async () => {
      const res = await request(app)
        .get(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(String(course._id));
      expect(res.body.name).toBe(course.name);
    });

    test('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/courses/:id', () => {
    let course;

    beforeEach(async () => {
      course = await Course.create({
        name: 'Test Course for Update',
        description: 'Test description',
        lesson_1: false,
        ws_1: false
      });
    });

    test('should update course', async () => {
      const updates = {
        name: 'Updated Course Name',
        description: 'Updated description',
        lesson_1: true
      };

      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updates);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(updates.name);
      expect(res.body.description).toBe(updates.description);
      expect(res.body.lesson_1).toBe(updates.lesson_1);
    });

    test('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: 'Updated' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    test('should delete course', async () => {
      const courseToDelete = await Course.create({
        name: 'Course To Delete',
        description: 'Test description',
        subject: 'Art',
        gradeLevel: '3-4',
        estimatedDuration: 20
      });

      const res = await request(app)
        .delete(`/api/courses/${courseToDelete._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Course deleted successfully');

      // Verify course is actually deleted
      const deletedCourse = await Course.findById(courseToDelete._id);
      expect(deletedCourse).toBeNull();
    });

    test('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(404);
    });
  });
});
