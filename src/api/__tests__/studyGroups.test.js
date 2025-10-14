const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');
const Classroom = require('../models/Classroom');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('Study Groups API', () => {
  let mongod;
  let token;
  let teacher;
  let students;
  let classroom;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    teacher = await User.create({
      name: 'Teacher', email: 't@t.com', password: 'pass', role: 'teacher',
    });
    students = await User.create([
      {
        name: 'S1', email: 's1@s.com', password: 'pass', role: 'student', gradeLevel: 3,
      },
      {
        name: 'S2', email: 's2@s.com', password: 'pass', role: 'student', gradeLevel: 3,
      },
    ]);
    classroom = await Classroom.create({
      name: 'Class A',
      description: 'Desc',
      teacher_user_id: teacher._id,
      student_user_ids: students.map((s) => s._id),
    });

    token = jwt.sign({ id: teacher._id, email: teacher.email, role: 'teacher' }, JWT_SECRET_KEY);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  test('create study group and fetch by classroom', async () => {
    const res = await request(app)
      .post('/api/studygroups')
      .set('Authorization', `Bearer ${token}`)
      .send({ classroomId: classroom._id, name: 'Group 1', memberUserIds: [teacher._id, students[0]._id] });
    expect(res.status).toBe(201);
    expect(res.body.classroomId).toBe(String(classroom._id));

    const list = await request(app)
      .get(`/api/studygroups/classroom/${classroom._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);
  });
});
