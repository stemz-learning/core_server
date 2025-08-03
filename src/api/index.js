const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const connectDB = require('./mongodb');

const userRoutes = require('./routes/userRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const physicalClassroomRoutes = require('./routes/physicalClassroomRoutes');
const worksheetRoutes = require('./routes/worksheetRoutes');
const auth = require('./routes/auth');
const userPointRoutes = require('./routes/userPointRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentResponseRoutes = require('./routes/studentResponseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const bpqQuestionRoutes = require('./routes/bpqQuestionRoutes');
const quizQuestionRoutes = require('./routes/quizQuestionRoutes');
const teachers = require('./routes/teacherRoutes');
const portalCourseRoutes = require('./routes/portalCourseRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'API - 👋🌎🌍🌏',
  });
});

// 🔥 ADD DEBUG ENDPOINT HERE 🔥
router.get('/debug/bpq-status', async (req, res) => {
  try {
    console.log('🔍 Debug endpoint called');
    console.log('🔍 MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('🔍 Database name:', process.env.DATABASE_NAME);
    
    // Test MongoDB connection
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.DATABASE_NAME);
    
    // Test connection
    await db.admin().ping();
    console.log('✅ MongoDB connection successful');
    
    // Check collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('📂 Available collections:', collectionNames);
    
    // Check BPQ questions collection specifically
    const bpqCollection = db.collection('bpqquestions');
    const totalQuestions = await bpqCollection.countDocuments();
    console.log('📊 Total BPQ questions in database:', totalQuestions);
    
    // Test the exact query that's failing
    const testQuery = {
      course_id: "astronomy",
      lesson_id: "1",
      gradeLevels: { $in: ["5"] }
    };
    console.log('🎯 Testing query:', testQuery);
    
    const testResults = await bpqCollection.find(testQuery).toArray();
    console.log('🎯 Query results:', testResults.length, 'questions found');
    
    // Also try alternative queries
    const altQuery1 = {
      course_id: "astronomy",
      lesson_id: 1,  // Number instead of string
      gradeLevels: { $in: ["5"] }
    };
    const altResults1 = await bpqCollection.find(altQuery1).toArray();
    
    const altQuery2 = {
      course_id: "astronomy",
      lesson_id: "1",
      gradeLevels: "5"  // Direct string instead of array
    };
    const altResults2 = await bpqCollection.find(altQuery2).toArray();
    
    // Get a sample document to see the structure
    const sampleDoc = await bpqCollection.findOne({});
    console.log('📄 Sample document structure:', sampleDoc);
    
    client.close();
    
    res.json({
      status: 'success',
      mongodb: {
        connected: true,
        database: process.env.DATABASE_NAME,
        collections: collectionNames,
        totalBpqQuestions: totalQuestions
      },
      testQueries: {
        originalQuery: {
          query: testQuery,
          results: testResults.length,
          sampleResult: testResults[0] || null
        },
        numericLessonId: {
          query: altQuery1,
          results: altResults1.length
        },
        directGradeString: {
          query: altQuery2,
          results: altResults2.length
        }
      },
      sampleDocument: sampleDoc
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack,
      environment: {
        mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        dbName: process.env.DATABASE_NAME ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
});
// 🔥 END DEBUG ENDPOINT 🔥


// Register all routes
router.use('/users', userRoutes);


router.use('/classrooms', classroomRoutes); // Online course system 
router.use('/physical-classrooms', physicalClassroomRoutes); // Real-world classroom system， teacher portal classrooms
router.use('/courses', courseRoutes); // Self-paced courses, worksheets, and quizzs
router.use('/worksheets', worksheetRoutes);
router.use('/auth', auth);
router.use('/points', userPointRoutes);
router.use('/grades', gradeRoutes);
router.use('/course', courseRoutes);
router.use('/grade', gradeRoutes);
router.use('/bpqquestions', bpqQuestionRoutes);
router.use('/quizquestions', quizQuestionRoutes);
router.use('/studentresponses', studentResponseRoutes);
router.use('/teachers', teachers);
router.use('/portalCourses', portalCourseRoutes);

// Updated notification and assignment systems
router.use('/notifications', notificationRoutes);
router.use('/assignments', assignmentRoutes);

router.use('/responses', studentResponseRoutes);


// 404 Not Found middleware
router.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: [
      '/api/docs',
      '/api/users',
      '/api/classrooms',
      '/api/physical-classrooms',
      '/api/notifications',
      '/api/assignments'
    ]
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = router;