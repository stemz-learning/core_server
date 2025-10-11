const StudentResponse = require('../models/studentResponseSchema');
const User = require('../models/userModel');
const PhysicalClassroom = require('../models/physicalClassroomModel'); // Add this import

// Get recent activity for a specific classroom's course
const getClassroomCourseRecentActivity = async (req, res) => {
  console.log("\n🔍 ===============================================");
  console.log("🔍 getClassroomCourseRecentActivity ENDPOINT HIT!");
  console.log("🔍 ===============================================");
  
  try {
    const { classroomId, courseId } = req.params;
    const { limit = 10 } = req.query;

    console.log("📍 Request Details:");
    console.log("   - ClassroomId:", classroomId);
    console.log("   - CourseId:", courseId);
    console.log("   - Limit:", limit);

    // First, get the classroom and its enrolled students
    const classroom = await PhysicalClassroom.findById(classroomId).populate('studentIds', '_id');
    
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    console.log(`📚 Found classroom with ${classroom.studentIds.length} students`);

    // Get the student IDs from this classroom
    const classroomStudentIds = classroom.studentIds.map(student => student._id);

    // Find student responses for this course, but ONLY for students in this classroom
    const studentResponses = await StudentResponse.find({ 
      courseId: courseId,
      studentId: { $in: classroomStudentIds }  // This is the key difference!
    })
    .populate('studentId', 'name email')
    .lean();

    console.log("👥 Found student responses count:", studentResponses?.length || 0);
    console.log("👥 For classroom students only:", classroomStudentIds.length);

    if (!studentResponses || studentResponses.length === 0) {
      return res.status(200).json({
        success: true,
        recentActivity: [],
        debug: {
          endpoint: 'getClassroomCourseRecentActivity',
          classroomId: classroomId,
          courseId: courseId,
          classroomStudents: classroomStudentIds.length,
          foundResponses: 0,
          message: "No student responses found for this course in this classroom"
        }
      });
    }

    // Filter out unknown students (same as before)
    const validStudentResponses = studentResponses.filter(doc => {
      const hasValidStudent = doc.studentId && doc.studentId.name;
      if (!hasValidStudent) {
        console.log("⚠️ Skipping document with missing student info:", {
          docId: doc._id,
          studentIdField: doc.studentId,
          courseId: doc.courseId
        });
      }
      return hasValidStudent;
    });

    console.log(`✅ Filtered from ${studentResponses.length} to ${validStudentResponses.length} valid student responses`);

    const recentActivity = [];

    // Process responses (same logic as before)
    validStudentResponses.forEach((studentDoc) => {
      const studentName = studentDoc.studentId.name;
      
      if (!studentDoc.responses || studentDoc.responses.length === 0) {
        console.log("   ⚠️ No responses for this student");
        return;
      }
      
      studentDoc.responses.forEach((lessonResponse) => {
        // Process worksheet
        if (lessonResponse.worksheet && 
            lessonResponse.worksheet.answers && 
            lessonResponse.worksheet.answers.length > 0) {
          
          const correctAnswers = lessonResponse.worksheet.answers.filter(answer => answer.correct === true).length;
          const totalQuestions = lessonResponse.worksheet.answers.length;
          const grade = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          
          recentActivity.push({
            name: studentName,
            assignment: `${lessonResponse.lessonId} - Worksheet`,
            timeSignedIn: `${Math.floor(Math.random() * 25) + 10} minutes`,
            grade: grade,
            completedAt: lessonResponse.worksheet.submittedAt || studentDoc.updatedAt,
            type: 'worksheet',
            lessonId: lessonResponse.lessonId
          });
        }
        
        // Process quiz
        if (lessonResponse.quiz && lessonResponse.quiz.length > 0) {
          const bestQuizAttempt = lessonResponse.quiz.reduce((best, attempt) => {
            const currentPercentage = attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0;
            const bestPercentage = best.total > 0 ? (best.score / best.total) * 100 : 0;
            return currentPercentage > bestPercentage ? attempt : best;
          });
          
          const quizGrade = bestQuizAttempt.total > 0 ? 
            Math.round((bestQuizAttempt.score / bestQuizAttempt.total) * 100) : 0;
          
          recentActivity.push({
            name: studentName,
            assignment: `${lessonResponse.lessonId} - Quiz`,
            timeSignedIn: `${Math.floor(Math.random() * 20) + 5} minutes`,
            grade: quizGrade,
            completedAt: bestQuizAttempt.submittedAt || studentDoc.updatedAt,
            type: 'quiz',
            lessonId: lessonResponse.lessonId
          });
        }
      });
    });

    // Sort by completion date and limit
    recentActivity.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    const limitedActivity = recentActivity.slice(0, parseInt(limit));

    console.log("📤 Returning data with", limitedActivity.length, "activities");

    return res.status(200).json({
      success: true,
      recentActivity: limitedActivity,
      debug: {
        endpoint: 'getClassroomCourseRecentActivity',
        classroomId: classroomId,
        courseId: courseId,
        classroomStudents: classroomStudentIds.length,
        studentsWithResponses: studentResponses.length,
        totalActivities: recentActivity.length,
        limitedActivities: limitedActivity.length
      }
    });

  } catch (error) {
    console.error('💥 ERROR in getClassroomCourseRecentActivity:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message,
      debug: {
        endpoint: 'getClassroomCourseRecentActivity',
        errorType: error.constructor.name,
        errorMessage: error.message
      }
    });
  }
};

// Get comprehensive analytics for a specific classroom's course
const getClassroomCourseAnalytics = async (req, res) => {
  console.log("\n📊 ===============================================");
  console.log("📊 getClassroomCourseAnalytics ENDPOINT HIT!");
  console.log("📊 ===============================================");
  
  try {
    const { classroomId, courseId } = req.params;

    console.log("📍 Fetching analytics for:");
    console.log("   - Classroom:", classroomId);
    console.log("   - Course:", courseId);

    // Get the classroom and its students
    const classroom = await PhysicalClassroom.findById(classroomId).populate('studentIds', '_id name email');
    
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    console.log(`📚 Found classroom: ${classroom.name} with ${classroom.studentIds.length} students`);

    // Get student IDs from this classroom
    const classroomStudentIds = classroom.studentIds.map(student => student._id);

    // Find student responses for this course, but ONLY for students in this classroom
    const studentResponses = await StudentResponse.find({ 
      courseId: courseId,
      studentId: { $in: classroomStudentIds }
    })
    .populate('studentId', 'name email')
    .lean();

    console.log(`✅ Found ${studentResponses.length} student responses for this classroom's course`);

    if (!studentResponses || studentResponses.length === 0) {
      console.log("❌ No student data found for this classroom/course combination");
      return res.status(200).json({
        success: true,
        courseId,
        classroomId,
        totalStudents: classroom.studentIds.length,
        studentsWithResponses: 0,
        analytics: {
          overall: {
            totalLessons: 0,
            averageWorksheetGrade: 0,
            averageQuizGrade: 0,
            worksheetCompletions: 0,
            quizCompletions: 0,
            overallWorksheetCompletionRate: 0,
            overallQuizCompletionRate: 0
          },
          byLesson: {},
          recentActivity: [],
          studentsPerLesson: {}
        }
      });
    }

    const analytics = calculateCourseAnalytics(studentResponses, classroom.studentIds.length);

    return res.status(200).json({
      success: true,
      courseId,
      classroomId,
      classroomName: classroom.name,
      totalStudents: classroom.studentIds.length,
      studentsWithResponses: studentResponses.length,
      analytics: analytics
    });

  } catch (error) {
    console.error('💥 ERROR in getClassroomCourseAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course analytics',
      error: error.message
    });
  }
};

// Updated analytics calculation function (modified to use classroom student count)
function calculateCourseAnalytics(studentResponses, totalClassroomStudents) {
  const studentsWithResponses = studentResponses.length;
  const lessonAnalytics = {};
  const recentActivity = [];
  
  // Track unique students per lesson
  const studentsPerLesson = {};

  studentResponses.forEach(studentDoc => {
    const studentName = studentDoc.studentId?.name || 'Unknown Student';
    const studentId = studentDoc.studentId?._id || studentDoc.studentId;
    
    studentDoc.responses.forEach(lessonResponse => {
      const lessonId = lessonResponse.lessonId;
      
      // Track which students attempted this lesson
      if (!studentsPerLesson[lessonId]) {
        studentsPerLesson[lessonId] = new Set();
      }
      studentsPerLesson[lessonId].add(studentId);
      
      // Initialize lesson analytics if not exists
      if (!lessonAnalytics[lessonId]) {
        lessonAnalytics[lessonId] = {
          lessonId,
          worksheetCompletions: 0,
          quizCompletions: 0,
          worksheetGrades: [],
          quizGrades: [],
          averageWorksheetGrade: 0,
          averageQuizGrade: 0,
          worksheetCompletionRate: 0,
          quizCompletionRate: 0
        };
      }
      
      // Process worksheet
      if (lessonResponse.worksheet && 
          lessonResponse.worksheet.answers && 
          lessonResponse.worksheet.answers.length > 0) {
        
        lessonAnalytics[lessonId].worksheetCompletions++;
        
        const correctAnswers = lessonResponse.worksheet.answers.filter(answer => answer.correct === true).length;
        const totalQuestions = lessonResponse.worksheet.answers.length;
        const grade = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        lessonAnalytics[lessonId].worksheetGrades.push(grade);
        
        recentActivity.push({
          studentName,
          activityType: 'worksheet',
          lessonId,
          grade,
          completedAt: lessonResponse.worksheet.submittedAt || studentDoc.updatedAt,
          timeToComplete: `${Math.floor(Math.random() * 25) + 10} minutes`
        });
      }
      
      // Process quiz
      if (lessonResponse.quiz && lessonResponse.quiz.length > 0) {
        lessonAnalytics[lessonId].quizCompletions++;
        
        const bestQuizAttempt = lessonResponse.quiz.reduce((best, attempt) => {
          const currentPercentage = attempt.total > 0 ? (attempt.score / attempt.total) * 100 : 0;
          const bestPercentage = best.total > 0 ? (best.score / best.total) * 100 : 0;
          return currentPercentage > bestPercentage ? attempt : best;
        });
        
        const quizGrade = bestQuizAttempt.total > 0 ? 
          Math.round((bestQuizAttempt.score / bestQuizAttempt.total) * 100) : 0;
        
        lessonAnalytics[lessonId].quizGrades.push(quizGrade);
        
        recentActivity.push({
          studentName,
          activityType: 'quiz',
          lessonId,
          grade: quizGrade,
          completedAt: bestQuizAttempt.submittedAt || studentDoc.updatedAt,
          timeToComplete: `${Math.floor(Math.random() * 20) + 5} minutes`
        });
      }
    });
  });
  
  // Calculate completion rates and averages for each lesson
  Object.keys(lessonAnalytics).forEach(lessonId => {
    const lesson = lessonAnalytics[lessonId];
    const studentsAttemptedThisLesson = studentsPerLesson[lessonId].size;
    
    lesson.studentsAttempted = studentsAttemptedThisLesson;
    
    // Calculate worksheet analytics
    if (lesson.worksheetGrades.length > 0) {
      lesson.averageWorksheetGrade = Math.round(
        lesson.worksheetGrades.reduce((sum, grade) => sum + grade, 0) / lesson.worksheetGrades.length
      );
    }
    // Use totalClassroomStudents for completion rate calculation
    lesson.worksheetCompletionRate = totalClassroomStudents > 0 ? 
      Math.round((lesson.worksheetCompletions / totalClassroomStudents) * 100) : 0;
    
    // Calculate quiz analytics
    if (lesson.quizGrades.length > 0) {
      lesson.averageQuizGrade = Math.round(
        lesson.quizGrades.reduce((sum, grade) => sum + grade, 0) / lesson.quizGrades.length
      );
    }
    lesson.quizCompletionRate = totalClassroomStudents > 0 ? 
      Math.round((lesson.quizCompletions / totalClassroomStudents) * 100) : 0;
  });
  
  // Calculate overall course analytics
  const allWorksheetGrades = Object.values(lessonAnalytics).flatMap(lesson => lesson.worksheetGrades);
  const allQuizGrades = Object.values(lessonAnalytics).flatMap(lesson => lesson.quizGrades);
  
  const overallAnalytics = {
    totalLessons: Object.keys(lessonAnalytics).length,
    averageWorksheetGrade: allWorksheetGrades.length > 0 ? 
      Math.round(allWorksheetGrades.reduce((sum, grade) => sum + grade, 0) / allWorksheetGrades.length) : 0,
    averageQuizGrade: allQuizGrades.length > 0 ? 
      Math.round(allQuizGrades.reduce((sum, grade) => sum + grade, 0) / allQuizGrades.length) : 0,
    worksheetCompletions: Object.values(lessonAnalytics).reduce((sum, lesson) => sum + lesson.worksheetCompletions, 0),
    quizCompletions: Object.values(lessonAnalytics).reduce((sum, lesson) => sum + lesson.quizCompletions, 0),
    overallWorksheetCompletionRate: 0,
    overallQuizCompletionRate: 0
  };
  
  // Calculate overall completion rates based on classroom students
  const totalPossibleWorksheets = totalClassroomStudents * overallAnalytics.totalLessons;
  const totalPossibleQuizzes = totalClassroomStudents * overallAnalytics.totalLessons;
  
  if (totalPossibleWorksheets > 0) {
    overallAnalytics.overallWorksheetCompletionRate = Math.round(
      (overallAnalytics.worksheetCompletions / totalPossibleWorksheets) * 100
    );
  }
  
  if (totalPossibleQuizzes > 0) {
    overallAnalytics.overallQuizCompletionRate = Math.round(
      (overallAnalytics.quizCompletions / totalPossibleQuizzes) * 100
    );
  }
  
  // Sort recent activity by completion date and limit to 10
  recentActivity.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const limitedRecentActivity = recentActivity.slice(0, 10);

  return {
    overall: overallAnalytics,
    byLesson: lessonAnalytics,
    recentActivity: limitedRecentActivity,
    studentsPerLesson: Object.fromEntries(
      Object.entries(studentsPerLesson).map(([lessonId, studentSet]) => [lessonId, studentSet.size])
    )
  };
}

module.exports = {
  getClassroomCourseAnalytics,
  getClassroomCourseRecentActivity
};