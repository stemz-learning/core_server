const StudentResponse = require('../models/studentResponseSchema');
const User = require('../models/userModel');

// local prediction testing
function generateLocalPredictions(inputScores) {
  console.log("🎯 Generating local predictions for scores:", inputScores);
  
  if (inputScores.length < 2) {
    throw new Error('Need at least 2 scores for prediction');
  }

  // Calculate trend and performance metrics
  const lastScore = inputScores[inputScores.length - 1];
  const secondLastScore = inputScores[inputScores.length - 2];
  const trend = lastScore - secondLastScore;
  const averageScore = inputScores.reduce((a, b) => a + b, 0) / inputScores.length;
  
  console.log(`📊 Analysis: Last=${lastScore}, Previous=${secondLastScore}, Trend=${trend}, Average=${averageScore}`);
  
  // Calculate improvement rate
  const improvementRate = trend;
  
  // Generate 3 future predictions with realistic constraints
  const predictions = [];
  
  for (let i = 0; i < 3; i++) {
    // Base prediction on last score + trend, but moderate the trend over time
    const trendDecay = Math.pow(0.85, i); // Trend effect decreases over time
    const basePredict = lastScore + (improvementRate * trendDecay);
    
    let prediction = basePredict;
    
    // Add small realistic variance (-2 to +2 points)
    prediction += (Math.random() * 4 - 2);
    
    // Ensure predictions stay within realistic bounds
    prediction = Math.max(0, Math.min(100, prediction));
    
    // Don't allow huge jumps between consecutive predictions (max 10 point change)
    if (i > 0) {
      const maxChange = 8;
      const prevPrediction = predictions[i - 1];
      prediction = Math.max(
        prevPrediction - maxChange, 
        Math.min(prevPrediction + maxChange, prediction)
      );
    }
    
    predictions.push(Math.round(prediction * 100) / 100);
  }

  const confidence = calculateConfidence(inputScores, trend);
  const avgFutureScore = predictions.reduce((a, b) => a + b, 0) / predictions.length;

  console.log("✅ Generated predictions:", predictions, "with confidence:", confidence);

  return {
    predicted_scores: predictions,
    average_future_score: Math.round(avgFutureScore * 100) / 100,
    confidence: confidence,
    trend_analysis: {
      trend_direction: trend > 1 ? 'improving' : trend < -1 ? 'declining' : 'stable',
      improvement_rate: Math.round(improvementRate * 100) / 100,
      average_performance: Math.round(averageScore * 100) / 100
    },
    method: 'local_trend_analysis',
    warning: avgFutureScore < 70 // Flag students who might need help
  };
}

function calculateConfidence(scores, trend) {
  // Higher confidence for more consistent performance
  const variance = calculateVariance(scores);
  const consistency = Math.max(0, 100 - variance * 2);
  
  // Moderate confidence for extreme trends (very high or very low changes)
  const trendStability = Math.max(30, 100 - Math.abs(trend) * 3);
  
  // More data points = higher confidence
  const dataConfidence = Math.min(100, scores.length * 20);
  
  const finalConfidence = (consistency + trendStability + dataConfidence) / 3;
  return Math.round(finalConfidence);
}

function calculateVariance(scores) {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
}

// Get all students' BPQ responses for a course
const getStudentBPQResponses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.query; // Optional: filter by specific lesson

    console.log("Received request for course:", courseId, "and student:", studentId);
    
    // Find all student responses for this course
    let query = { courseId };
    
    const studentResponses = await StudentResponse.find(query)
      .populate('studentId', 'name email') // Get student name and email
      .lean(); // For better performance

    console.log("Student response found:", studentResponse);
    
    // Transform the data for easier frontend consumption
    const studentsData = studentResponses.map(studentDoc => {
      let relevantResponses = studentDoc.responses;
      
      // Filter by lesson if specified
      if (lessonId) {
        relevantResponses = relevantResponses.filter(response => 
          response.lessonId === lessonId
        );
      }
      
      // Extract all BPQ responses from all lessons
      const allBPQResponses = [];
      relevantResponses.forEach(lessonResponse => {
        lessonResponse.bpqResponses.forEach(bpq => {
          allBPQResponses.push({
            ...bpq,
            lessonId: lessonResponse.lessonId
          });
        });
      });
      
      return {
        studentId: studentDoc.studentId._id,
        studentName: studentDoc.studentId.name,
        studentEmail: studentDoc.studentId.email,
        bpqResponses: allBPQResponses,
        lastUpdated: studentDoc.updatedAt
      };
    });
    
    return res.status(200).json({
      success: true,
      data: studentsData
    });
    
  } catch (error) {
    console.error('Error fetching student BPQ responses:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch student responses', 
      error: error.message 
    });
  }
};

// Get responses for a specific student
const getIndividualStudentResponses = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const { lessonId } = req.query;
    
    const studentResponse = await StudentResponse.findOne({ 
      studentId, 
      courseId 
    }).populate('studentId', 'name email');
    
    if (!studentResponse) {
      return res.status(404).json({ 
        message: 'No response data found for this student' 
      });
    }
    
    let responses = studentResponse.responses;
    if (lessonId) {
      responses = responses.filter(response => response.lessonId === lessonId);
    }
    
    return res.status(200).json({
      success: true,
      student: {
        id: studentResponse.studentId._id,
        name: studentResponse.studentId.name,
        email: studentResponse.studentId.email
      },
      responses: responses
    });
    
  } catch (error) {
    console.error('Error fetching individual student responses:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch student responses', 
      error: error.message 
    });
  }
};

// Get scores from BPQ responses all students in a course
const getStudentAnalyticsScores = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { lessonId, studentId } = req.query;
  
      // Build query
      let query = { courseId };
      if (studentId) {
        query.studentId = studentId;
      }
  
      const studentResponses = await StudentResponse.find(query)
        .populate('studentId', 'name email')
        .lean();

        console.log('studentResponses:', studentResponses);
  
      const analyticsData = studentResponses.map(studentDoc => {
        let relevantResponses = studentDoc.responses;
  
        if (lessonId) {
          relevantResponses = relevantResponses.filter(response =>
            response.lessonId === lessonId
          );
        }
  
        const allScores = [];
        relevantResponses.forEach(lessonResponse => {
          lessonResponse.bpqResponses.forEach(bpq => {
            if (bpq.scores) {
              allScores.push({
                questionId: bpq.questionId,
                lessonId: lessonResponse.lessonId,
                timestamp: bpq.timestamp,
                scores: bpq.scores
              });
            }
          });
        });
  
        const avgScores = {
          Creativity: 0,
          "Critical Thinking": 0,
          Observation: 0,
          Curiosity: 0,
          "Problem Solving": 0
        };
  
        if (allScores.length > 0) {
          const totals = { ...avgScores };
  
          allScores.forEach(scoreData => {
            Object.keys(totals).forEach(skill => {
              totals[skill] += scoreData.scores[skill] || 0;
            });
          });
  
          Object.keys(avgScores).forEach(skill => {
            avgScores[skill] = Math.round(totals[skill] / allScores.length);
          });
        }
  
        return {
          studentId: studentDoc.studentId._id,
          studentName: studentDoc.studentId.name,
          studentEmail: studentDoc.studentId.email,
          averageScores: avgScores,
          individualScores: allScores,
          totalResponses: allScores.length,
          lastUpdated: studentDoc.updatedAt
        };
      });
  
      return res.status(200).json({
        success: true,
        data: analyticsData
      });
  
    } catch (error) {
      console.error('Error fetching student analytics scores:', error);
      return res.status(500).json({
        message: 'Failed to fetch analytics scores',
        error: error.message
      });
    }
  };
  

// Get scores for a specific student across all courses
const getStudentOverallScores = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find all student responses across all courses
    const studentResponses = await StudentResponse.find({ studentId }) // changed to find() for all courses
      .populate('studentId', 'name email');

    if (!studentResponses || studentResponses.length === 0) {
      return res.status(404).json({
        message: 'No response data found for this student'
      });
    }

    // Collect all BPQ responses into one array
    const allResponses = [];
    studentResponses.forEach(studentResponse => {
      studentResponse.responses.forEach(lessonResponse => {
        lessonResponse.bpqResponses.forEach(bpq => {
          if (bpq.scores) {
            allResponses.push({
              questionId: bpq.questionId,
              lessonId: lessonResponse.lessonId,
              scores: bpq.scores,
              timestamp: bpq.timestamp,
            });
          }
        });
      });
    });

    // Initialize totals
    const skillKeys = ["Creativity", "Critical Thinking", "Observation", "Curiosity", "Problem Solving"];
    const totals = Object.fromEntries(skillKeys.map(k => [k, 0]));

    // Sum up all scores
    allResponses.forEach(response => {
      skillKeys.forEach(skill => {
        totals[skill] += response.scores?.[skill] || 0;
      });
    });

    // Calculate averages
    const avgScores = {};
    if (allResponses.length > 0) {
      skillKeys.forEach(skill => {
        avgScores[skill] = Math.round(totals[skill] / allResponses.length);
      });
    }

    return res.status(200).json({
      success: true,
      studentId,
      averageScores: avgScores,
      allResponses
    });

  } catch (error) {
    console.error('Error fetching student overall scores:', error);
    return res.status(500).json({
      message: 'Failed to fetch student overall scores',
      error: error.message
    });
  }
};

// Get scores for a specific student in a specific course
const getStudentCourseScores = async (req, res) => {
    try {
      const { courseId, studentId } = req.params; // courseId and studentId from params
      const { lessonId } = req.query; // Optionally, filter by specific lesson
  
      // Find the student responses for the given course and student
      const studentResponse = await StudentResponse.findOne({ 
        studentId, 
        courseId 
      }).populate('studentId', 'name email');
      
      if (!studentResponse) {
        return res.status(404).json({ 
          message: 'No response data found for this student in the specified course' 
        });
      }
  
      let relevantResponses = studentResponse.responses;
      
      // If a lessonId is provided, filter the responses by lesson
      if (lessonId) {
        relevantResponses = relevantResponses.filter(response => 
          response.lessonId === lessonId
        );
      }
  
      // Extract all scores from the BPQ responses for the student in the course
      const allScores = [];
      relevantResponses.forEach(lessonResponse => {
        lessonResponse.bpqResponses.forEach(bpq => {
          if (bpq.scores) {
            allScores.push(bpq.scores); // Collect all scores
          }
        });
      });
  
      // Calculate the average scores across all responses for this student in the course
      const avgScores = {
        Creativity: 0,
        "Critical Thinking": 0,
        Observation: 0,
        Curiosity: 0,
        "Problem Solving": 0
      };
  
      if (allScores.length > 0) {
        const totals = { ...avgScores };
  
        // Summing up the individual scores
        allScores.forEach(scoreData => {
          Object.keys(totals).forEach(skill => {
            totals[skill] += scoreData[skill] || 0;
          });
        });
  
        // Calculate the average for each skill
        Object.keys(avgScores).forEach(skill => {
          avgScores[skill] = Math.round(totals[skill] / allScores.length);
        });
      }
  
      return res.status(200).json({
        success: true,
        studentId: studentResponse.studentId._id,
        studentName: studentResponse.studentId.name,
        courseId,
        averageScores: avgScores
      });
  
    } catch (error) {
      console.error('Error fetching student course scores:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch student course scores', 
        error: error.message 
      });
    }
  };

  // get quiz scores for predictive analysis
  const getStudentQuizScores = async (req, res) => {
    try {
      const { courseId, studentId } = req.params;
      
      const studentResponse = await StudentResponse.findOne({ 
        studentId, 
        courseId 
      }).populate('studentId', 'name email');
      
      if (!studentResponse) {
        return res.status(404).json({ 
          message: 'No response data found for this student in the specified course' 
        });
      }
      
      // Extract quiz data from responses
      const quizData = studentResponse.responses
        .filter(response => response.quiz && response.quiz.length > 0)
        .map(response => {
          // Calculate quiz score as percentage
          const correctAnswers = response.quiz.filter(answer => 
            answer.isCorrect || answer.correct // Handle different field names
          ).length;
          const totalQuestions = response.quiz.length;
          const score = (correctAnswers / totalQuestions) * 100;
          
          return {
            lessonId: response.lessonId,
            score: Math.round(score),
            totalQuestions,
            correctAnswers,
            completedAt: response.completedAt || studentResponse.updatedAt
          };
        })
        .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
      
      return res.status(200).json({
        success: true,
        studentId: studentResponse.studentId._id,
        studentName: studentResponse.studentId.name,
        courseId,
        quizScores: quizData,
        canPredict: quizData.length >= 2,
        completedQuizzes: quizData.length
      });
      
    } catch (error) {
      console.error('Error fetching student quiz scores:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch student quiz scores', 
        error: error.message 
      });
    }
  };

// // getting quiz predictions using local logic - using stored values
// const getQuizPredictions = async (req, res) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   try {
//     console.log("=== LOCAL Quiz Predictions with DEBUG Start ===");
//     const { studentId } = req.params;
//     console.log("StudentId:", studentId);

//     if (!studentId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Student ID is required'
//       });
//     }

//     console.log("Starting DB query...");
//     const dbStart = Date.now();
    
//     const studentResponses = await StudentResponse.find({ studentId })
//       .populate('studentId', 'name email')
//       .lean();

//     console.log(`DB query took ${Date.now() - dbStart} ms`);
//     console.log("Found student responses:", studentResponses?.length || 0);

//     if (!studentResponses || studentResponses.length === 0) {
//       console.log("❌ No student responses found");
//       return res.status(404).json({
//         success: false,
//         message: 'No response data found for this student'
//       });
//     }

//     console.log("\n=== DATABASE STRUCTURE DEBUG ===");
//     studentResponses.forEach((courseResponse, idx) => {
//       console.log(`Course ${idx + 1} structure:`, {
//         courseId: courseResponse.courseId,
//         responsesCount: courseResponse.responses?.length || 0,
//         studentInfo: courseResponse.studentId ? {
//           id: courseResponse.studentId._id,
//           name: courseResponse.studentId.name
//         } : 'No student info'
//       });
//     });

//     console.log("\n=== PROCESSING QUIZ RESPONSES (LATEST PER COURSE) ===");
//     const latestQuizzesByCourse = {};

//     studentResponses.forEach((courseResponse, index) => {
//       console.log(`\n=== COURSE ${index + 1} DEBUG ===`);
//       console.log(`CourseId:`, courseResponse.courseId);
//       console.log(`Responses count:`, courseResponse.responses?.length || 0);

//       if (!courseResponse.responses || courseResponse.responses.length === 0) {
//         console.log(`❌ Course ${index + 1} - No responses found`);
//         return;
//       }

//       const courseAttempts = [];

//       courseResponse.responses.forEach((response, responseIndex) => {
//         console.log(`\n  --- Response ${responseIndex + 1} ---`);
//         console.log(`  LessonId: ${response.lessonId}`);
//         console.log(`  Has quiz field: ${!!response.quiz}`);
//         console.log(`  Quiz length: ${response.quiz?.length || 0}`);

//         if (Array.isArray(response.quiz) && response.quiz.length > 0) {
//           response.quiz.forEach((attempt, attemptIdx) => {
//             console.log(`    Attempt ${attemptIdx + 1}:`, {
//               attemptNumber: attempt.attemptNumber,
//               score: attempt.score,
//               total: attempt.total
//             });

//             if ('score' in attempt && 'total' in attempt && attempt.total > 0) {
//               const scorePercentage = (attempt.score / attempt.total) * 100;
//               courseAttempts.push({
//                 courseId: courseResponse.courseId,
//                 lessonId: response.lessonId,
//                 attemptNumber: attempt.attemptNumber,
//                 score: Math.round(scorePercentage * 100) / 100,
//                 correctAnswers: attempt.score,
//                 totalQuestions: attempt.total,
//                 completedAt: attempt.submittedAt || response.completedAt || courseResponse.updatedAt || new Date(),
//                 rawData: {
//                   storedScore: attempt.score,
//                   storedTotal: attempt.total
//                 }
//               });
//             } else {
//               console.log(`    ❌ Invalid attempt data for lesson ${response.lessonId}`);
//             }
//           });
//         }
//       });

//       if (courseAttempts.length > 0) {
//         courseAttempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
//         latestQuizzesByCourse[courseResponse.courseId] = courseAttempts[0];
//         console.log(`✅ Latest quiz chosen for course ${courseResponse.courseId}:`, courseAttempts[0]);
//       }
//     });

//     let allQuizzes = Object.values(latestQuizzesByCourse);

//     // Sort by completion date (oldest first for prediction timeline)
//     allQuizzes.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

//     // Limit to max 5 quizzes
//     if (allQuizzes.length > 6) {
//       allQuizzes = allQuizzes.slice(-6);
//     }

//     console.log("\n=== FINAL QUIZ SUMMARY ===");
//     console.log("Total quizzes found:", allQuizzes.length);
//     console.log("Quiz details:", allQuizzes.map(q => ({
//       courseId: q.courseId,
//       lesson: q.lessonId,
//       attempt: q.attemptNumber,
//       score: q.score
//     })));

//     if (allQuizzes.length < 2) {
//       console.log("❌ Not enough quizzes for prediction");
//       return res.status(400).json({
//         success: false,
//         message: 'Student needs to complete at least 2 quizzes across all courses for predictions',
//         completedQuizzes: allQuizzes.length,
//         requiredQuizzes: 2,
//         availableQuizzes: allQuizzes
//       });
//     }

//     const inputScores = allQuizzes.map(quiz => quiz.score);
//     console.log("🎯 Input scores for prediction:", inputScores);

//     console.log("🚀 Generating LOCAL predictions...");
//     const predictionStart = Date.now();
//     const predictions = generateLocalPredictions(inputScores);
//     console.log(`✅ Local prediction took ${Date.now() - predictionStart} ms`);
//     console.log("Prediction results:", predictions);

//     const studentInfo = studentResponses[0].studentId;

//     return res.status(200).json({
//       success: true,
//       studentId: studentInfo._id,
//       studentName: studentInfo.name,
//       inputScores,
//       predictions: predictions,
//       completedQuizzes: allQuizzes.length,
//       totalQuizzesExpected: 5,
//       chartData: [
//         ...allQuizzes.map((quiz, index) => ({
//           quiz: `Quiz ${index + 1}`,
//           type: 'Completed',
//           score: Math.round(quiz.score),
//         })),
//         ...predictions.predicted_scores.map((score, index) => ({
//           quiz: `Quiz ${allQuizzes.length + index + 1}`,
//           type: 'Predicted',
//           score: Math.round(score),
//         })),
//       ],
//       predictionMethod: 'Local Trend Analysis',
//       confidence: predictions.confidence,
//       trendAnalysis: predictions.trend_analysis
//     });

//   } catch (error) {
//     console.error('=== ERROR in getQuizPredictions ===');
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to get quiz predictions',
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// };

const getQuizPredictions = async (req, res) => {
  try {
    const TOTAL_QUIZZES_EXPECTED = 5;
    const studentId = req.params.studentId;

    console.log(`Fetching quiz predictions for student: ${studentId}`);

    // Get student info
    const studentInfo = await Student.findById(studentId);
    if (!studentInfo) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch all course responses for the student
    const studentResponses = await StudentCourseResponse.find({ studentId }).lean();
    console.log(`Found ${studentResponses.length} course responses`);

    // Latest quiz per course
    const latestQuizzesByCourse = {};

    studentResponses.forEach(courseResponse => {
      if (!courseResponse.responses || courseResponse.responses.length === 0) return;

      const courseAttempts = [];
      courseResponse.responses.forEach(response => {
        if (Array.isArray(response.quiz) && response.quiz.length > 0) {
          response.quiz.forEach(attempt => {
            if ('score' in attempt && 'total' in attempt && attempt.total > 0) {
              courseAttempts.push({
                courseId: courseResponse.courseId,
                lessonId: response.lessonId,
                attemptNumber: attempt.attemptNumber,
                score: (attempt.score / attempt.total) * 100,
                correctAnswers: attempt.score,
                totalQuestions: attempt.total,
                completedAt: attempt.submittedAt || response.completedAt || courseResponse.updatedAt || new Date()
              });
            }
          });
        }
      });

      if (courseAttempts.length > 0) {
        courseAttempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        latestQuizzesByCourse[courseResponse.courseId] = courseAttempts[0];
      }
    });

    // Convert to array
    let allQuizzes = Object.values(latestQuizzesByCourse);

    // Sort by date ASC
    allQuizzes.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    // Cap completed quizzes at TOTAL_QUIZZES_EXPECTED
    if (allQuizzes.length > TOTAL_QUIZZES_EXPECTED) {
      allQuizzes = allQuizzes.slice(-TOTAL_QUIZZES_EXPECTED);
    }

    const completedCount = allQuizzes.length;
    const remainingCount = TOTAL_QUIZZES_EXPECTED - completedCount;

    console.log(`Completed quizzes: ${completedCount}, Remaining slots for predictions: ${remainingCount}`);

    const inputScores = allQuizzes.map(q => q.score);

    // Generate predictions only if needed
    let predictedScores = [];
    if (remainingCount > 0) {
      const predictionResult = generateLocalPredictions(inputScores);
      predictedScores = predictionResult.predicted_scores.slice(0, remainingCount);
    }

    return res.status(200).json({
      success: true,
      studentId: studentInfo._id,
      studentName: studentInfo.name,
      inputScores,
      predictions: predictedScores,
      completedQuizzes: completedCount,
      totalQuizzesExpected: TOTAL_QUIZZES_EXPECTED,
      chartData: [
        ...allQuizzes.map((quiz, index) => ({
          quiz: `Quiz ${index + 1}`,
          type: 'Completed',
          score: Math.round(quiz.score),
        })),
        ...predictedScores.map((score, index) => ({
          quiz: `Quiz ${completedCount + index + 1}`,
          type: 'Predicted',
          score: Math.round(score),
        })),
      ]
    });

  } catch (error) {
    console.error('Error generating quiz predictions:', error.stack || error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



module.exports = {
  getStudentBPQResponses,
  getIndividualStudentResponses,
  getStudentAnalyticsScores,
  getStudentOverallScores,
  getStudentCourseScores,
  getStudentQuizScores,
  getQuizPredictions
};