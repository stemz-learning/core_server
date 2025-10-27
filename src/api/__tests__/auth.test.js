const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('Auth API', () => {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('POST /api/auth/signup', () => {
    test('should create a new teacher account', async () => {
      const teacherData = {
        name: 'Test Teacher',
        email: `teacher${Date.now()}@test.com`,
        password: 'password123',
        role: 'teacher'
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(teacherData);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.name).toBe(teacherData.name);
      expect(res.body.user.email).toBe(teacherData.email);
      expect(res.body.user.role).toBe('teacher');
      expect(res.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should create a new student account', async () => {
      const studentData = {
        name: 'Test Student',
        email: `student${Date.now()}@test.com`,
        password: 'password123',
        role: 'student',
        gradeLevel: 3
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(studentData);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.name).toBe(studentData.name);
      expect(res.body.user.email).toBe(studentData.email);
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.gradeLevel).toBe(studentData.gradeLevel);
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'Incomplete User',
        email: `incomplete${Date.now()}@test.com`
        // Missing password and role
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(incompleteData);
      
      expect(res.status).toBe(400);
    });

    test('should return 400 for invalid role', async () => {
      const invalidData = {
        name: 'Invalid User',
        email: `invalid${Date.now()}@test.com`,
        password: 'password123',
        role: 'invalid_role'
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(invalidData);
      
      expect(res.status).toBe(400);
    });

    test('should return 400 for duplicate email', async () => {
      // Use a static counter to ensure uniqueness
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 100000);
      const existingEmail = `existing${timestamp}-${random}@test.com`;
      
      // Create first user via API
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Existing User',
          email: existingEmail,
          password: 'password123',
          role: 'teacher'
        });

      // Try to create another user with the same email
      const duplicateData = {
        name: 'Duplicate User',
        email: existingEmail, // Same email
        password: 'password123',
        role: 'student'
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(duplicateData);
      
      expect(res.status).toBe(400);
    });

    test('should hash password before saving', async () => {
      const userData = {
        name: 'Password Test User',
        email: `passwordtest${Date.now()}@test.com`,
        password: 'plaintext123',
        role: 'teacher'
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      
      expect(res.status).toBe(201);
      
      // Verify password is hashed by checking the database directly
      const createdUser = await User.findOne({ email: userData.email });
      expect(createdUser.password).not.toBe('plaintext123');
      expect(createdUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      const loginEmail = `logintest${Date.now()}@test.com`;
      testUser = await User.create({
        name: 'Login Test User',
        email: loginEmail,
        password: 'password123',
        role: 'teacher'
      });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(loginData.email);
      expect(res.body.user.password).toBeDefined(); // Password is returned in login response
    });

    test('should return 404 for missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.status).toBe(404);
    });

    test('should return 401 for missing password', async () => {
      const loginData = {
        email: testUser.email
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.status).toBe(401);
    });

    test('should return 404 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.status).toBe(404);
    });

    test('should return 401 for invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.status).toBe(401);
    });

    test('should generate valid JWT token', async () => {
      const loginData = {
        email: testUser.email,
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.status).toBe(200);
      
      // Verify the token is valid
      const decoded = jwt.verify(res.body.token, JWT_SECRET_KEY);
      expect(decoded.id).toBe(String(testUser._id));
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
    });
  });

  describe('POST /api/auth/verify', () => {
    let testUser;
    let validToken;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Verify Test User',
        email: `verifytest${Date.now()}@test.com`,
        password: 'password123',
        role: 'student',
        gradeLevel: 4
      });

      validToken = jwt.sign(
        { id: testUser._id, email: testUser.email, role: testUser.role },
        JWT_SECRET_KEY
      );
    });

    test('should verify valid token', async () => {
      const res = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.id).toBe(String(testUser._id));
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.role).toBe(testUser.role);
    });

    test('should return 401 for missing token', async () => {
      const res = await request(app)
        .post('/api/auth/verify');
      
      expect(res.status).toBe(401);
    });

    test('should return 403 for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      
      const res = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${invalidToken}`);
      
      expect(res.status).toBe(403);
    });

    test('should return 403 for expired token', async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id, email: testUser.email, role: testUser.role },
        JWT_SECRET_KEY,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );
      
      const res = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(res.status).toBe(403);
    });

    test('should return 200 for token with non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const tokenWithFakeUser = jwt.sign(
        { id: fakeUserId, email: 'fake@test.com', role: 'teacher' },
        JWT_SECRET_KEY
      );
      
      const res = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${tokenWithFakeUser}`);
      
      expect(res.status).toBe(200);
    });
  });
});
