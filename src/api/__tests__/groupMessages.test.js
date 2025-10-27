const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { app } = require('../../index');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const StudyGroup = require('../models/StudyGroup');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '12345678';

describe('Group Messages API', () => {
  let mongod;
  let token;
  let teacher;
  let student;
  let classroom;
  let group;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    teacher = await User.create({
      name: 'Teacher', email: 't2@t.com', password: 'pass', role: 'teacher',
    });
    student = await User.create({
      name: 'Stu', email: 'stu@t.com', password: 'pass', role: 'student', gradeLevel: 3,
    });
    classroom = await Classroom.create({
      name: 'Class B',
      description: 'Desc',
      teacher_user_id: teacher._id,
      student_user_ids: [student._id],
    });
    group = await StudyGroup.create({ classroomId: classroom._id, memberUserIds: [teacher._id, student._id], createdBy: teacher._id });

    token = jwt.sign({ id: teacher._id, email: teacher.email, role: 'teacher' }, JWT_SECRET_KEY);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  test('post and list messages', async () => {
    const msg1 = await request(app)
      .post(`/api/group-messages/${group._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello' });
    expect(msg1.status).toBe(201);

    const msg2 = await request(app)
      .post(`/api/group-messages/${group._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'World' });
    expect(msg2.status).toBe(201);

    const list = await request(app)
      .get(`/api/group-messages/${group._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.map((m) => m.content)).toEqual(['Hello', 'World']);
  });
});
