const StudentResponse = require('../models/studentResponseSchema');
const User = require('../models/userModel');

// Get recent activity for a course (for the Active Users component) - DEBUG VERSION
const getCourseRecentActivity = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { limit = 10 } = req.query;

    console.log("=== DEBUG getCourseRecentActivity ===");
    console.log("CourseId from params:", courseId);
    console.log("Limit:", limit);

    // First, let's see what courses exist in the database
    const allCourses = await StudentResponse.distinct('courseId');
    console.log("All courses in database:", allCourses);

    const studentResponses = await StudentResponse.find({ courseId })
      .populate('studentId', 'name email')
      .lean();

    console.log("Found student responses count:", studentResponses?.length || 0);

    if (!studentResponses || studentResponses.length === 0) {
      console.log("No student responses found for courseId:", courseId);
      
      // Let's also check if there are ANY student responses at all
      const totalResponses = await StudentResponse.countDocuments();
      console.log("Total student responses in database:", totalResponses);
      
      return res.status(200).json({
        success: true,
        recentActivity: [],
        debug: {
          courseId,
          foundResponses: 0,
          allCourses,
          totalResponsesInDB: totalResponses
        }
      });
    }

    console.log("\n=== ANALYZING STUDENT RESPONSES ===");
    const recentActivity = [];

    studentResponses.forEach((studentDoc, studentIndex) => {
      const studentName = studentDoc.studentId?.name || 'Unknown Student';
      console.log(`\nStudent ${studentIndex + 1}: ${studentName}`);
      console.log("Student responses count:", studentDoc.responses?.length || 0);
      
      if (!studentDoc.responses || studentDoc.responses.length === 0) {
        console.log("  No responses for this student");
        return;
      }
      
      studentDoc.responses.forEach((lessonResponse, lessonIndex) => {
        console.log(`  Lesson ${lessonIndex + 1}: ${lessonResponse.lessonId}`);
        
        // Check worksheet
        const hasWorksheet = lessonResponse.worksheet && 
                            lessonResponse.worksheet.answers && 
                            lessonResponse.worksheet.answers.length > 0;
        console.log(`    Has worksheet: ${hasWorksheet}`);
        
        if (hasWorksheet) {
          const correctAnswers = lessonResponse.worksheet.answers.filter(answer => answer.correct === true).length;
          const totalQuestions = lessonResponse.worksheet.answers.length;
          const grade = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          
          console.log(`    Worksheet: ${correctAnswers}/${totalQuestions} = ${grade}%`);
          
          recentActivity.push({
            name: studentName,
            assignment: `${lessonResponse.lessonId} - Worksheet`,
            timeSignedIn: `${Math.floor(Math.random() * 25) + 10} minutes`,
            grade: grade,
            completedAt: lessonResponse.worksheet.submittedAt || studentDoc.updatedAt
          });
        }
        
        // Check quiz
        const hasQuiz = lessonResponse.quiz && lessonResponse.quiz.length > 0;
        console.log(`    Has quiz: ${hasQuiz}`);
        console.log(`    Quiz length: ${lessonResponse.quiz?.length || 0}`);
        
        if (hasQuiz) {
          console.log("    Quiz attempts:", lessonResponse.quiz.map(q => ({
            score: q.score,
            total: q.total,
            attemptNumber: q.attemptNumber
          })));
          
          const bestQuizAttempt = lessonResponse.quiz.reduce((best, attempt) => {
            const currentScore = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
            const bestScore = best.total > 0 ? Math.round((best.score / best.total) * 100) : 0;
            return currentScore > bestScore ? attempt : best;
          });
          
          const quizGrade = bestQuizAttempt.total > 0 ? Math.round((bestQuizAttempt.score / bestQuizAttempt.total) * 100) : 0;
          console.log(`    Best quiz: ${bestQuizAttempt.score}/${bestQuizAttempt.total} = ${quizGrade}%`);
          
          recentActivity.push({
            name: studentName,
            assignment: `${lessonResponse.lessonId} - Quiz`,
            timeSignedIn: `${Math.floor(Math.random() * 20) + 5} minutes`,
            grade: quizGrade,
            completedAt: bestQuizAttempt.submittedAt || studentDoc.updatedAt
          });
        }
      });
    });

    console.log("\n=== FINAL RESULTS ===");
    console.log("Total recent activities found:", recentActivity.length);
    console.log("Activities:", recentActivity.map(a => `${a.name} - ${a.assignment} (${a.grade}%)`));

    // Sort by completion date and limit
    recentActivity.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    const limitedActivity = recentActivity.slice(0, parseInt(limit));

    return res.status(200).json({
      success: true,
      recentActivity: limitedActivity,
      debug: {
        courseId,
        studentsFound: studentResponses.length,
        totalActivities: recentActivity.length,
        allCourses
      }
    });

  } catch (error) {
    console.error('Error fetching course recent activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
};

// Keep your existing getCourseAnalytics function unchanged
const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log("Fetching analytics for course:", courseId);

    // Get all student responses for this course
    const studentResponses = await StudentResponse.find({ courseId })
      .populate('studentId', 'name email')
      .lean();

    if (!studentResponses || studentResponses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No student data found for this course'
      });
    }

    console.log(`Found ${studentResponses.length} students in course`);

    // Calculate analytics
    const analytics = calculateCourseAnalytics(studentResponses);

    return res.status(200).json({
      success: true,
      courseId,
      totalStudents: studentResponses.length,
      analytics: analytics
    });

  } catch (error) {
    console.error('Error fetching course analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course analytics',
      error: error.message
    });
  }
};

// Calculate completion rates and grades from student response data
function calculateCourseAnalytics(studentResponses) {
  const totalStudents = studentResponses.length;
  
  // Track completion and grades by lesson
  const lessonAnalytics = {};
  
  // Track recent activity for the "Active Users" section
  const recentActivity = [];
  
  studentResponses.forEach(studentDoc => {
    const studentName = studentDoc.studentId?.name || 'Unknown Student';
    
    studentDoc.responses.forEach(lessonResponse => {
      const lessonId = lessonResponse.lessonId;
      
      // Initialize lesson analytics if not exists
      if (!lessonAnalytics[lessonId]) {
        lessonAnalytics[lessonId] = {
          lessonId,
          totalStudents: 0,
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
      
      lessonAnalytics[lessonId].totalStudents++;
      
      // Check worksheet completion and calculate grade
      if (lessonResponse.worksheet && lessonResponse.worksheet.answers && lessonResponse.worksheet.answers.length > 0) {
        lessonAnalytics[lessonId].worksheetCompletions++;
        
        // Calculate worksheet grade from correct answers
        const correctAnswers = lessonResponse.worksheet.answers.filter(answer => answer.correct === true).length;
        const totalQuestions = lessonResponse.worksheet.answers.length;
        const grade = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        lessonAnalytics[lessonId].worksheetGrades.push(grade);
        
        // Add to recent activity
        recentActivity.push({
          studentName,
          activityType: 'worksheet',
          lessonId,
          grade,
          completedAt: lessonResponse.worksheet.submittedAt || studentDoc.updatedAt,
          timeToComplete: `${Math.floor(Math.random() * 25) + 10} minutes` // Mock time for now
        });
      }
      
      // Check quiz completion and get grades
      if (lessonResponse.quiz && lessonResponse.quiz.length > 0) {
        lessonAnalytics[lessonId].quizCompletions++;
        
        // Get the best quiz attempt score
        const bestQuizAttempt = lessonResponse.quiz.reduce((best, attempt) => {
          const currentScore = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
          const bestScore = best.total > 0 ? Math.round((best.score / best.total) * 100) : 0;
          return currentScore > bestScore ? attempt : best;
        });
        
        const quizGrade = bestQuizAttempt.total > 0 ? Math.round((bestQuizAttempt.score / bestQuizAttempt.total) * 100) : 0;
        lessonAnalytics[lessonId].quizGrades.push(quizGrade);
        
        // Add to recent activity
        recentActivity.push({
          studentName,
          activityType: 'quiz',
          lessonId,
          grade: quizGrade,
          completedAt: bestQuizAttempt.submittedAt || studentDoc.updatedAt,
          timeToComplete: `${Math.floor(Math.random() * 20) + 5} minutes` // Mock time for now
        });
      }
    });
  });
  
  // Calculate averages and completion rates for each lesson
  Object.keys(lessonAnalytics).forEach(lessonId => {
    const lesson = lessonAnalytics[lessonId];
    
    // Worksheet analytics
    if (lesson.worksheetGrades.length > 0) {
      lesson.averageWorksheetGrade = Math.round(
        lesson.worksheetGrades.reduce((sum, grade) => sum + grade, 0) / lesson.worksheetGrades.length
      );
    }
    lesson.worksheetCompletionRate = Math.round((lesson.worksheetCompletions / totalStudents) * 100);
    
    // Quiz analytics
    if (lesson.quizGrades.length > 0) {
      lesson.averageQuizGrade = Math.round(
        lesson.quizGrades.reduce((sum, grade) => sum + grade, 0) / lesson.quizGrades.length
      );
    }
    lesson.quizCompletionRate = Math.round((lesson.quizCompletions / totalStudents) * 100);
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
  
  const totalPossibleWorksheets = totalStudents * overallAnalytics.totalLessons;
  const totalPossibleQuizzes = totalStudents * overallAnalytics.totalLessons;
  
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
  
  // Sort recent activity by completion date (most recent first) and limit to 10
  recentActivity.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const limitedRecentActivity = recentActivity.slice(0, 10);
  
  return {
    overall: overallAnalytics,
    byLesson: lessonAnalytics,
    recentActivity: limitedRecentActivity
  };
}

module.exports = {
  getCourseAnalytics,
  getCourseRecentActivity
};