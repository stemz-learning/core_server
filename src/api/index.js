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

// debugging endpoint
router.get('/debug/post-merge-analysis', async (req, res) => {
  try {
    console.log('🔍 POST-MERGE ANALYSIS');
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🔍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('🔍 DATABASE_NAME env var:', process.env.DATABASE_NAME);
    
    // Show the ACTUAL URI being used (masked for security)
    const uri = process.env.MONGODB_URI;
    if (uri) {
      const uriParts = uri.split('/');
      const databaseFromUri = uriParts[uriParts.length - 1]?.split('?')[0];
      console.log('🔍 Database name extracted from URI:', databaseFromUri);
      console.log('🔍 Full URI structure:', {
        protocol: uriParts[0],
        host: uriParts[2]?.split('@')[1],
        database: databaseFromUri
      });
    }
    
    // Test the actual connection
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    
    // Method 1: Default database from connection
    const defaultDb = client.db();
    const actualDbName = defaultDb.databaseName;
    console.log('🔍 ACTUAL connected database name:', actualDbName);
    
    // Method 2: If using DATABASE_NAME env var
    let envDb = null;
    let envDbName = null;
    if (process.env.DATABASE_NAME) {
      envDb = client.db(process.env.DATABASE_NAME);
      envDbName = envDb.databaseName;
      console.log('🔍 DATABASE_NAME env var points to:', envDbName);
    }
    
    // Method 3: Force connect to STEMz_Teacher_Platform
    const correctDb = client.db('STEMz_Teacher_Platform');
    const correctDbName = correctDb.databaseName;
    console.log('🔍 Forced STEMz_Teacher_Platform connection:', correctDbName);
    
    // Check BPQ counts in each
    const actualDbBpqCount = await defaultDb.collection('bpqquestions').countDocuments();
    const correctDbBpqCount = await correctDb.collection('bpqquestions').countDocuments();
    
    let envDbBpqCount = 0;
    if (envDb) {
      envDbBpqCount = await envDb.collection('bpqquestions').countDocuments();
    }
    
    console.log('🔍 BPQ Counts:');
    console.log(`  - Actual connected DB (${actualDbName}): ${actualDbBpqCount}`);
    console.log(`  - Correct DB (STEMz_Teacher_Platform): ${correctDbBpqCount}`);
    if (envDb) {
      console.log(`  - Env var DB (${envDbName}): ${envDbBpqCount}`);
    }
    
    // Check what your current code is actually using
    const currentlyUsedDb = process.env.DATABASE_NAME ? 
      client.db(process.env.DATABASE_NAME) : 
      client.db();
    
    const currentlyUsedDbName = currentlyUsedDb.databaseName;
    const currentlyUsedBpqCount = await currentlyUsedDb.collection('bpqquestions').countDocuments();
    
    console.log('🔍 What your code is ACTUALLY using:');
    console.log(`  - Database: ${currentlyUsedDbName}`);
    console.log(`  - BPQ Count: ${currentlyUsedBpqCount}`);
    
    client.close();
    
    res.json({
      analysis: {
        environment: process.env.NODE_ENV,
        mongoUriExists: !!process.env.MONGODB_URI,
        databaseNameEnvVar: process.env.DATABASE_NAME || null,
      },
      connections: {
        defaultFromUri: {
          name: actualDbName,
          bpqCount: actualDbBpqCount
        },
        correctDatabase: {
          name: correctDbName,
          bpqCount: correctDbBpqCount
        },
        envVarDatabase: envDb ? {
          name: envDbName,
          bpqCount: envDbBpqCount
        } : null,
        currentlyUsedByCode: {
          name: currentlyUsedDbName,
          bpqCount: currentlyUsedBpqCount,
          isCorrect: currentlyUsedDbName === 'STEMz_Teacher_Platform'
        }
      },
      diagnosis: {
        problem: currentlyUsedBpqCount === 0 ? 'Connected to wrong/empty database' : 'Connection seems correct',
        expectedBpqCount: 396,
        actualBpqCount: currentlyUsedBpqCount,
        recommendation: currentlyUsedDbName !== 'STEMz_Teacher_Platform' ? 
          `Change database connection from ${currentlyUsedDbName} to STEMz_Teacher_Platform` :
          'Database connection looks correct, investigate other issues'
      }
    });
    
  } catch (error) {
    console.error('❌ Post-merge analysis error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      possibleCauses: [
        'MongoDB URI changed during merge',
        'Environment variables overwritten',
        'Database connection code modified',
        'New environment variable added that overrides connection'
      ]
    });
  }
});

// another debug for env vars
router.get('/debug/vercel-env-check', async (req, res) => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return res.json({
        error: 'MONGODB_URI not found',
        allEnvVars: Object.keys(process.env).filter(key => key.includes('MONGO'))
      });
    }
    
    // Parse the URI to show the database name
    const uriParts = uri.split('/');
    const databaseFromUri = uriParts[uriParts.length - 1]?.split('?')[0];
    
    // Show last 50 characters of URI (for security)
    const uriEnd = uri.length > 50 ? '...' + uri.slice(-50) : uri;
    
    res.json({
      environment: process.env.NODE_ENV,
      mongoUriExists: true,
      mongoUriEnd: uriEnd,
      extractedDatabaseName: databaseFromUri,
      uriStructure: {
        protocol: uriParts[0],
        hasHost: uriParts.length >= 3,
        hasDatabaseName: !!databaseFromUri && databaseFromUri.length > 0,
        databaseName: databaseFromUri
      },
      issue: databaseFromUri !== 'STEMz_Teacher_Platform' ? 
        `Database name is "${databaseFromUri}" but should be "STEMz_Teacher_Platform"` : 
        'Database name looks correct',
      deploymentInfo: {
        vercelUrl: process.env.VERCEL_URL,
        vercelEnv: process.env.VERCEL_ENV,
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
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