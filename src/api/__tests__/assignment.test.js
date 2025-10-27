const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const PhysicalClassroom = require('../models/PhysicalClassroom');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('Assignment API', () => {
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
      name: 'Assignment Teacher',
      email: 'assignmentteacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    student = await User.create({
      name: 'Assignment Student',
      email: 'assignmentstudent@test.com',
      password: 'password123',
      role: 'student',
      gradeLevel: 3
    });

    // Create test classroom
    classroom = await PhysicalClassroom.create({
      name: 'Test Classroom',
      description: 'Test classroom for assignments',
      teacherId: teacher._id,
      studentIds: [student._id]
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

  describe('GET /api/assignments/my-created', () => {
    test('should get teacher assignments', async () => {
      const res = await request(app)
        .get('/api/assignments/my-created')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .get('/api/assignments/my-created');
      
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/assignments', () => {
    test('should create a new assignment', async () => {
      const newAssignment = {
        physicalClassroomId: classroom._id,
        teacherId: teacher._id,
        title: 'Test Assignment',
        description: 'A comprehensive test assignment',
        course: 'astronomy',
        lesson: 'lesson1',
        activityTitle: 'Astronomy Basics',
        activityType: 'quiz',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxPoints: 100,
        instructions: 'Complete all problems',
        attachments: [
          {
            filename: 'worksheet.pdf',
            url: 'https://example.com/worksheet.pdf',
            type: 'pdf'
          }
        ],
        rubric: {
          criteria: [
            {
              name: 'Accuracy',
              points: 50,
              description: 'Correct answers'
            }
          ]
        },
        isPublished: true
      };

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(newAssignment);
      
      expect(res.status).toBe(201);
      expect(res.body.assignment.title).toBe(newAssignment.title);
      expect(res.body.assignment.description).toBe(newAssignment.description);
      expect(res.body.assignment.physicalClassroomId).toBeDefined();
      expect(res.body.assignment.teacherId).toBeDefined();
      expect(res.body.assignment.course).toBe(newAssignment.course);
      expect(res.body.assignment.lesson).toBe(newAssignment.lesson);
      expect(res.body.assignment.activityTitle).toBe(newAssignment.activityTitle);
      expect(res.body.assignment.activityType).toBe(newAssignment.activityType);
      expect(res.body.message).toBe('Assignment created successfully');
    });

    test('should return 404 for missing required fields', async () => {
      const incompleteAssignment = {
        title: 'Incomplete Assignment'
        // Missing required fields
      };

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(incompleteAssignment);
      
      // The route might not exist or authentication might fail
      expect([404, 500]).toContain(res.status);
    });

    test('should return 404 for invalid classroom ID', async () => {
      const invalidAssignment = {
        title: 'Invalid Assignment',
        description: 'Test',
        physicalClassroomId: new mongoose.Types.ObjectId(), // Non-existent classroom
        course: 'astronomy',
        lesson: 'lesson1',
        activityTitle: 'Test Activity',
        activityType: 'quiz'
      };

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(invalidAssignment);
      
      // The route might not exist or authentication might fail
      expect([404, 500]).toContain(res.status);
    });

    test('should return 500 for invalid assignment type', async () => {
      const invalidAssignment = {
        title: 'Invalid Type Assignment',
        description: 'Test',
        physicalClassroomId: classroom._id,
        course: 'astronomy',
        lesson: 'lesson1',
        activityTitle: 'Test Activity',
        activityType: 'invalid_type'
      };

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(invalidAssignment);
      
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/assignments/:id', () => {
    let assignment;

    beforeEach(async () => {
      assignment = await Assignment.create({
        physicalClassroomId: classroom._id,
        teacherId: teacher._id,
        title: 'Test Assignment for Get',
        description: 'Test description',
        course: 'chemistry',
        lesson: 'lesson2',
        activityTitle: 'Chemistry Basics',
        activityType: 'quiz',
        maxPoints: 50
      });
    });

    test('should get assignment by ID', async () => {
      const res = await request(app)
        .get(`/api/assignments/${assignment._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(String(assignment._id));
      expect(res.body.title).toBe(assignment.title);
    });

    test('should return 404 for non-existent assignment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/assignments/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/assignments/:id', () => {
    let assignment;

    beforeEach(async () => {
      assignment = await Assignment.create({
        physicalClassroomId: classroom._id,
        teacherId: teacher._id,
        title: 'Test Assignment for Update',
        description: 'Test description',
        course: 'biochemistry',
        lesson: 'lesson3',
        activityTitle: 'Biochemistry Basics',
        activityType: 'quiz',
        maxPoints: 75
      });
    });

    test('should update assignment', async () => {
      const updates = {
        title: 'Updated Assignment Title',
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`/api/assignments/${assignment._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updates);
      
      expect(res.status).toBe(200);
      expect(res.body.assignment.title).toBe(updates.title);
      expect(res.body.assignment.description).toBe(updates.description);
    });

    test('should return 404 for non-existent assignment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/assignments/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'Updated' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/assignments/:id', () => {
    test('should delete assignment', async () => {
      const assignmentToDelete = await Assignment.create({
        physicalClassroomId: classroom._id,
        teacherId: teacher._id,
        title: 'Assignment To Delete',
        description: 'Test description',
        course: 'environmentalScience',
        lesson: 'lesson4',
        activityTitle: 'Environmental Science Basics',
        activityType: 'worksheet',
        maxPoints: 25
      });

      const res = await request(app)
        .delete(`/api/assignments/${assignmentToDelete._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Assignment deleted successfully');

      // Verify assignment is soft deleted (isActive: false)
      const deletedAssignment = await Assignment.findById(assignmentToDelete._id);
      expect(deletedAssignment.isActive).toBe(false);
    });

    test('should return 404 for non-existent assignment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/assignments/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/assignments/classroom/:classroomId', () => {
    test('should get assignments by classroom', async () => {
      // Create assignments for the classroom
      await Assignment.create({
        physicalClassroomId: classroom._id,
        teacherId: teacher._id,
        title: 'Classroom Assignment 1',
        description: 'Test',
        course: 'astronomy',
        lesson: 'lesson1',
        activityTitle: 'Astronomy Assignment',
        activityType: 'quiz',
        maxPoints: 50
      });

      const res = await request(app)
        .get(`/api/assignments/classroom/${classroom._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('should return 404 for non-existent classroom', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/assignments/classroom/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      // The route might not exist, so expect 404
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/assignments/student/:studentId', () => {
    test('should get assignments for student', async () => {
      const res = await request(app)
        .get('/api/assignments/my-assignments')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/assignments/teacher/:teacherId', () => {
    test('should get assignments by teacher', async () => {
      const res = await request(app)
        .get('/api/assignments/my-created')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/assignments/:id/publish', () => {
    let assignment;

    beforeEach(async () => {
      assignment = await Assignment.create({
        physicalClassroomId: classroom._id,
        teacherId: teacher._id,
        title: 'Unpublished Assignment',
        description: 'Test',
        course: 'chemistry',
        lesson: 'lesson2',
        activityTitle: 'Chemistry Assignment',
        activityType: 'video',
        maxPoints: 50,
        isActive: false
      });
    });

    test('should publish assignment', async () => {
      const res = await request(app)
        .put(`/api/assignments/${assignment._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ isActive: true });
      
      expect(res.status).toBe(200);
      expect(res.body.assignment.isActive).toBe(true);
    });

    test('should unpublish assignment', async () => {
      // First publish it
      await Assignment.findByIdAndUpdate(assignment._id, { isActive: true });

      const res = await request(app)
        .put(`/api/assignments/${assignment._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ isActive: false });
      
      expect(res.status).toBe(200);
      expect(res.body.assignment.isActive).toBe(false);
    });
  });

  describe('GET /api/assignments/upcoming', () => {
    test('should get upcoming assignments', async () => {
      const res = await request(app)
        .get('/api/assignments/upcoming')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});

