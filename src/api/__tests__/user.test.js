const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('User API', () => {
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
      name: 'Test Teacher',
      email: 'teacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    student = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
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

  describe('GET /api/users', () => {
    test('should get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    test('should get all users without authentication', async () => {
      const res = await request(app)
        .get('/api/users');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/users/id/:id', () => {
    test('should get user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/id/${teacher._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(String(teacher._id));
      expect(res.body.name).toBe('Test Teacher');
      expect(res.body.email).toBe('teacher@test.com');
    });

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/users/id/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/users/email/:email', () => {
    test('should get user by email', async () => {
      const res = await request(app)
        .get(`/api/users/email/${teacher.email}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(teacher.email);
    });

    test('should return 404 for non-existent email', async () => {
      const res = await request(app)
        .get('/api/users/email/nonexistent@test.com')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/users/create', () => {
    test('should create a new teacher', async () => {
      const newTeacher = {
        name: 'New Teacher',
        email: 'newteacher@test.com',
        password: 'password123',
        role: 'teacher'
      };

      const res = await request(app)
        .post('/api/users/create')
        .send(newTeacher);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newTeacher.name);
      expect(res.body.email).toBe(newTeacher.email);
      expect(res.body.role).toBe('teacher');
      expect(res.body.password).toBeDefined(); // Password is returned (hashed)
    });

    test('should create a new student with grade level', async () => {
      const newStudent = {
        name: 'New Student',
        email: 'newstudent@test.com',
        password: 'password123',
        role: 'student',
        gradeLevel: 4
      };

      const res = await request(app)
        .post('/api/users/create')
        .send(newStudent);
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newStudent.name);
      expect(res.body.email).toBe(newStudent.email);
      expect(res.body.role).toBe('student');
      expect(res.body.gradeLevel).toBe(4);
    });

    test('should hash password', async () => {
      const newUser = {
        name: 'Password Test User',
        email: 'passwordtest@test.com',
        password: 'plaintext123',
        role: 'teacher'
      };

      const res = await request(app)
        .post('/api/users/create')
        .send(newUser);
      
      expect(res.status).toBe(201);
      
      // Verify password is hashed by checking the database directly
      const createdUser = await User.findById(res.body._id);
      expect(createdUser.password).not.toBe('plaintext123');
      expect(createdUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteUser = {
        name: 'Incomplete User',
        email: 'incomplete@test.com'
        // Missing password and role
      };

      const res = await request(app)
        .post('/api/users/create')
        .send(incompleteUser);
      
      expect(res.status).toBe(400);
    });

    test('should return 400 for invalid role', async () => {
      const invalidUser = {
        name: 'Invalid User',
        email: 'invalid@test.com',
        password: 'password123',
        role: 'invalid_role'
      };

      const res = await request(app)
        .post('/api/users/create')
        .send(invalidUser);
      
      expect(res.status).toBe(400);
    });

    test('should return 400 for invalid grade level', async () => {
      const invalidStudent = {
        name: 'Invalid Student',
        email: 'invalidstudent@test.com',
        password: 'password123',
        role: 'student',
        gradeLevel: 10 // Invalid grade level
      };

      const res = await request(app)
        .post('/api/users/create')
        .send(invalidStudent);
      
      expect(res.status).toBe(400);
    });

    test('should return 400 for duplicate email', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: teacher.email, // Using existing email
        password: 'password123',
        role: 'teacher'
      };

      const res = await request(app)
        .post('/api/users/create')
        .send(duplicateUser);
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/users/id/:id', () => {
    test('should update user', async () => {
      const updates = {
        name: 'Updated Teacher Name',
        email: 'updated@test.com'
      };

      const res = await request(app)
        .put(`/api/users/id/${teacher._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updates);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(updates.name);
      expect(res.body.email).toBe(updates.email);
    });

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/users/id/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: 'Updated' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id/grade', () => {
    test('should update student grade level', async () => {
      const res = await request(app)
        .put(`/api/users/${student._id}/grade`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ gradeLevel: 5 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.gradeLevel).toBe(5);
    });

    test('should return 400 for invalid grade level', async () => {
      const res = await request(app)
        .put(`/api/users/${student._id}/grade`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ gradeLevel: 10 });
      
      expect(res.status).toBe(400);
    });

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/users/${fakeId}/grade`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ gradeLevel: 3 });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/users/id/:id', () => {
    test('should delete user', async () => {
      // Create a user to delete
      const userToDelete = await User.create({
        name: 'User To Delete',
        email: 'delete@test.com',
        password: 'password123',
        role: 'teacher'
      });

      const res = await request(app)
        .delete(`/api/users/id/${userToDelete._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted');

      // Verify user is actually deleted
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/users/id/${fakeId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(res.status).toBe(404);
    });
  });
});
