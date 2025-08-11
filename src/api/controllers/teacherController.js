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
  
// getting quiz predictions using local logic
// const getQuizPredictions = async (req, res) => {
//   // Add CORS headers immediately
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   try {
//     console.log("=== LOCAL Quiz Predictions Start ===");
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
    
//     // Fetch all student responses (keep your existing DB logic)
//     const studentResponses = await StudentResponse.find({ studentId })
//       .populate('studentId', 'name email')
//       .lean();

//     console.log(`DB query took ${Date.now() - dbStart} ms`);
//     console.log("Found student responses:", studentResponses?.length || 0);

//     if (!studentResponses || studentResponses.length === 0) {
//       console.log("No student responses found");
//       return res.status(404).json({
//         success: false,
//         message: 'No response data found for this student'
//       });
//     }

//     // Extract all quiz scores (keep your existing quiz processing logic)
//     const allQuizzes = [];
//     console.log("Processing responses...");
    
//     studentResponses.forEach((courseResponse, index) => {
//       console.log(`Course ${index + 1} - CourseId:`, courseResponse.courseId);
//       console.log(`Course ${index + 1} - Responses:`, courseResponse.responses?.length || 0);

//       if (!courseResponse.responses || courseResponse.responses.length === 0) {
//         console.log(`Course ${index + 1} - No responses found`);
//         return;
//       }

//       const courseQuizzes = courseResponse.responses
//         .filter(response => {
//           const hasQuiz = response.quiz && Array.isArray(response.quiz) && response.quiz.length > 0;
//           console.log(`  Response lessonId: ${response.lessonId}, has quiz: ${hasQuiz}, quiz length: ${response.quiz?.length || 0}`);
//           return hasQuiz;
//         })
//         .map(response => {
//           try {
//             const correctAnswers = response.quiz.filter(answer =>
//               answer.isCorrect === true || answer.correct === true
//             ).length;
//             const totalQuestions = response.quiz.length;
//             const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

//             console.log(`  Quiz: ${correctAnswers}/${totalQuestions} = ${score.toFixed(2)}%`);

//             return {
//               courseId: courseResponse.courseId,
//               lessonId: response.lessonId,
//               score: Math.round(score * 100) / 100,
//               completedAt: response.completedAt || courseResponse.updatedAt || new Date(),
//               totalQuestions,
//               correctAnswers
//             };
//           } catch (error) {
//             console.log(`  Error processing quiz for lesson ${response.lessonId}:`, error.message);
//             return null;
//           }
//         })
//         .filter(quiz => quiz !== null);

//       console.log(`Course ${index + 1} - Valid quizzes found:`, courseQuizzes.length);
//       allQuizzes.push(...courseQuizzes);
//     });

//     console.log("Total quizzes found:", allQuizzes.length);
//     allQuizzes.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

//     console.log("Sorted quizzes:", allQuizzes.map(q => ({
//       lessonId: q.lessonId,
//       score: q.score,
//       completedAt: q.completedAt
//     })));

//     if (allQuizzes.length < 2) {
//       console.log("Not enough quizzes for prediction");
//       return res.status(400).json({
//         success: false,
//         message: 'Student needs to complete at least 2 quizzes across all courses for predictions',
//         completedQuizzes: allQuizzes.length,
//         requiredQuizzes: 2,
//         availableQuizzes: allQuizzes.map(q => ({
//           lessonId: q.lessonId,
//           score: q.score
//         }))
//       });
//     }

//     // Use all available scores for better prediction (not just first 2)
//     const inputScores = allQuizzes.map(quiz => quiz.score);
//     console.log("Input scores for prediction:", inputScores);

//     // 🎯 USE LOCAL PREDICTIONS INSTEAD OF GRADIO API
//     console.log("🚀 Generating LOCAL predictions...");
//     const predictionStart = Date.now();
    
//     const predictions = generateLocalPredictions(inputScores);
    
//     console.log(`✅ Local prediction took ${Date.now() - predictionStart} ms`);
//     console.log("Prediction results:", predictions);

//     const studentInfo = studentResponses[0].studentId;

//     const responseData = {
//       success: true,
//       studentId: studentInfo._id,
//       studentName: studentInfo.name,
//       inputScores,
//       predictions: predictions, // This now contains our local predictions
//       completedQuizzes: allQuizzes.length,
//       totalQuizzesExpected: 5,
//       chartData: [
//         // Add completed quizzes
//         ...allQuizzes.map((quiz, index) => ({
//           quiz: `Quiz ${index + 1}`,
//           type: 'Completed',
//           score: Math.round(quiz.score),
//         })),
//         // Add predicted quizzes
//         ...predictions.predicted_scores.map((score, index) => ({
//           quiz: `Quiz ${allQuizzes.length + index + 1}`,
//           type: 'Predicted',
//           score: Math.round(score),
//         })),
//       ],
//       // Add extra info for the frontend
//       predictionMethod: 'Local Trend Analysis',
//       confidence: predictions.confidence,
//       trendAnalysis: predictions.trend_analysis
//     };

//     console.log("=== LOCAL Quiz Predictions End ===");
//     return res.status(200).json(responseData);

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

// COMPLETE getQuizPredictions function with enhanced debugging
const getQuizPredictions = async (req, res) => {
  // Add CORS headers immediately
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log("=== LOCAL Quiz Predictions with DEBUG Start ===");
    const { studentId } = req.params;
    console.log("StudentId:", studentId);

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    console.log("Starting DB query...");
    const dbStart = Date.now();
    
    // Fetch all student responses
    const studentResponses = await StudentResponse.find({ studentId })
      .populate('studentId', 'name email')
      .lean();

    console.log(`DB query took ${Date.now() - dbStart} ms`);
    console.log("Found student responses:", studentResponses?.length || 0);

    if (!studentResponses || studentResponses.length === 0) {
      console.log("❌ No student responses found");
      return res.status(404).json({
        success: false,
        message: 'No response data found for this student'
      });
    }

    // Debug: Log the overall structure
    console.log("\n=== DATABASE STRUCTURE DEBUG ===");
    studentResponses.forEach((courseResponse, idx) => {
      console.log(`Course ${idx + 1} structure:`, {
        courseId: courseResponse.courseId,
        responsesCount: courseResponse.responses?.length || 0,
        studentInfo: courseResponse.studentId ? {
          id: courseResponse.studentId._id,
          name: courseResponse.studentId.name
        } : 'No student info'
      });
    });

    // Extract all quiz scores with ENHANCED DEBUGGING
    const allQuizzes = [];
    console.log("\n=== PROCESSING QUIZ RESPONSES ===");

    studentResponses.forEach((courseResponse, index) => {
      console.log(`\n=== COURSE ${index + 1} DEBUG ===`);
      console.log(`CourseId:`, courseResponse.courseId);
      console.log(`Responses count:`, courseResponse.responses?.length || 0);
      
      // Debug: Log the structure of the first response
      if (courseResponse.responses && courseResponse.responses.length > 0) {
        console.log(`First response structure:`, {
          lessonId: courseResponse.responses[0].lessonId,
          hasQuiz: !!courseResponse.responses[0].quiz,
          quizIsArray: Array.isArray(courseResponse.responses[0].quiz),
          quizLength: courseResponse.responses[0].quiz?.length,
          responseKeys: Object.keys(courseResponse.responses[0]),
          quizSample: courseResponse.responses[0].quiz?.slice(0, 2) // First 2 quiz questions
        });
      }

      if (!courseResponse.responses || courseResponse.responses.length === 0) {
        console.log(`❌ Course ${index + 1} - No responses found`);
        return;
      }

      const courseQuizzes = courseResponse.responses
        .map((response, responseIndex) => {
          console.log(`\n  --- Response ${responseIndex + 1} ---`);
          console.log(`  LessonId: ${response.lessonId}`);
          console.log(`  Response keys: ${Object.keys(response)}`);
          console.log(`  Has quiz field: ${!!response.quiz}`);
          console.log(`  Quiz is array: ${Array.isArray(response.quiz)}`);
          console.log(`  Quiz length: ${response.quiz?.length || 0}`);
          
          // Check if quiz exists and has data
          const hasQuiz = response.quiz && Array.isArray(response.quiz) && response.quiz.length > 0;
          
          if (!hasQuiz) {
            console.log(`  ❌ No valid quiz data for lesson ${response.lessonId}`);
            
            // Debug: Check what fields ARE available
            console.log(`  Available response fields:`, Object.keys(response));
            
            // Check if quiz data might be in a different field
            const possibleQuizFields = Object.keys(response).filter(key => 
              key.toLowerCase().includes('quiz') || 
              key.toLowerCase().includes('question') ||
              key.toLowerCase().includes('answer')
            );
            console.log(`  Possible quiz fields:`, possibleQuizFields);
            
            return null;
          }

          // Debug: Look at quiz question structure in detail
          console.log(`  📝 Quiz questions analysis:`);
          response.quiz.slice(0, 3).forEach((question, qIdx) => {
            console.log(`    Question ${qIdx + 1}:`, {
              keys: Object.keys(question),
              hasIsCorrect: 'isCorrect' in question,
              hasCorrect: 'correct' in question,
              isCorrectValue: question.isCorrect,
              correctValue: question.correct,
              // Log full question structure for first question only
              ...(qIdx === 0 && { fullStructure: question })
            });
          });

          try {
            // Try multiple methods to count correct answers
            const correctAnswersMethod1 = response.quiz.filter(answer =>
              answer.isCorrect === true
            ).length;
            
            const correctAnswersMethod2 = response.quiz.filter(answer =>
              answer.correct === true
            ).length;

            const correctAnswersMethod3 = response.quiz.filter(answer =>
              answer.isCorrect === true || answer.correct === true
            ).length;

            // Try boolean string values too
            const correctAnswersMethod4 = response.quiz.filter(answer =>
              answer.isCorrect === 'true' || answer.correct === 'true'
            ).length;

            // Try looking for other possible fields
            const correctAnswersMethod5 = response.quiz.filter(answer =>
              answer.selected === answer.correctAnswer ||
              answer.userAnswer === answer.correctAnswer ||
              answer.isRight === true ||
              answer.right === true
            ).length;

            console.log(`  📊 Correct answer counts:`);
            console.log(`    Method 1 (isCorrect===true): ${correctAnswersMethod1}`);
            console.log(`    Method 2 (correct===true): ${correctAnswersMethod2}`);
            console.log(`    Method 3 (either boolean true): ${correctAnswersMethod3}`);
            console.log(`    Method 4 (string 'true'): ${correctAnswersMethod4}`);
            console.log(`    Method 5 (other fields): ${correctAnswersMethod5}`);

            const totalQuestions = response.quiz.length;
            
            // Use the method that gives the highest reasonable result
            const correctAnswers = Math.max(
              correctAnswersMethod1, 
              correctAnswersMethod2, 
              correctAnswersMethod3, 
              correctAnswersMethod4, 
              correctAnswersMethod5
            );
            
            const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

            console.log(`  🎯 Final calculation: ${correctAnswers}/${totalQuestions} = ${score.toFixed(2)}%`);

            // If we still get zero score, do deep debugging
            if (score === 0 && totalQuestions > 0) {
              console.log(`  🔍 ZERO SCORE DEEP DEBUG:`);
              console.log(`  Full quiz data for lesson ${response.lessonId}:`);
              response.quiz.forEach((q, idx) => {
                if (idx < 3) { // Only log first 3 to avoid spam
                  console.log(`    Question ${idx + 1} FULL DATA:`, JSON.stringify(q, null, 2));
                }
              });
            }

            return {
              courseId: courseResponse.courseId,
              lessonId: response.lessonId,
              score: Math.round(score * 100) / 100,
              completedAt: response.completedAt || courseResponse.updatedAt || new Date(),
              totalQuestions,
              correctAnswers,
              debugInfo: {
                methods: [correctAnswersMethod1, correctAnswersMethod2, correctAnswersMethod3, correctAnswersMethod4, correctAnswersMethod5],
                rawQuizLength: response.quiz.length
              }
            };
          } catch (error) {
            console.log(`  ❌ Error processing quiz for lesson ${response.lessonId}:`, error.message);
            console.log(`  Error stack:`, error.stack);
            return null;
          }
        })
        .filter(quiz => quiz !== null);

      console.log(`✅ Course ${index + 1} - Valid quizzes found: ${courseQuizzes.length}`);
      if (courseQuizzes.length > 0) {
        console.log(`✅ Course ${index + 1} - Quiz scores:`, courseQuizzes.map(q => `${q.lessonId}: ${q.score}%`));
      }
      
      allQuizzes.push(...courseQuizzes);
    });

    console.log("\n=== FINAL QUIZ SUMMARY ===");
    console.log("Total quizzes found:", allQuizzes.length);
    console.log("All scores:", allQuizzes.map(q => q.score));
    console.log("Non-zero scores:", allQuizzes.filter(q => q.score > 0).map(q => q.score));
    console.log("Quiz details:", allQuizzes.map(q => ({
      lesson: q.lessonId,
      score: q.score,
      correct: q.correctAnswers,
      total: q.totalQuestions
    })));

    // Sort by completion date
    allQuizzes.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    if (allQuizzes.length < 2) {
      console.log("❌ Not enough quizzes for prediction");
      return res.status(400).json({
        success: false,
        message: 'Student needs to complete at least 2 quizzes across all courses for predictions',
        completedQuizzes: allQuizzes.length,
        requiredQuizzes: 2,
        availableQuizzes: allQuizzes.map(q => ({
          lessonId: q.lessonId,
          score: q.score,
          correctAnswers: q.correctAnswers,
          totalQuestions: q.totalQuestions
        })),
        debugInfo: "Check server logs for detailed quiz processing information"
      });
    }

    // Use all available scores for better prediction
    const inputScores = allQuizzes.map(quiz => quiz.score);
    console.log("🎯 Input scores for prediction:", inputScores);

    // Generate LOCAL predictions
    console.log("🚀 Generating LOCAL predictions...");
    const predictionStart = Date.now();
    
    const predictions = generateLocalPredictions(inputScores);
    
    console.log(`✅ Local prediction took ${Date.now() - predictionStart} ms`);
    console.log("Prediction results:", predictions);

    const studentInfo = studentResponses[0].studentId;

    const responseData = {
      success: true,
      studentId: studentInfo._id,
      studentName: studentInfo.name,
      inputScores,
      predictions: predictions,
      completedQuizzes: allQuizzes.length,
      totalQuizzesExpected: 5,
      chartData: [
        // Add completed quizzes
        ...allQuizzes.map((quiz, index) => ({
          quiz: `Quiz ${index + 1}`,
          type: 'Completed',
          score: Math.round(quiz.score),
        })),
        // Add predicted quizzes
        ...predictions.predicted_scores.map((score, index) => ({
          quiz: `Quiz ${allQuizzes.length + index + 1}`,
          type: 'Predicted',
          score: Math.round(score),
        })),
      ],
      // Add extra info for debugging and frontend
      predictionMethod: 'Local Trend Analysis',
      confidence: predictions.confidence,
      trendAnalysis: predictions.trend_analysis,
      debugInfo: {
        totalQuizzesProcessed: allQuizzes.length,
        quizDetails: allQuizzes.map(q => ({
          lesson: q.lessonId,
          score: q.score,
          correct: q.correctAnswers,
          total: q.totalQuestions
        }))
      }
    };

    console.log("=== LOCAL Quiz Predictions DEBUG End ===");
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('=== ERROR in getQuizPredictions ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Failed to get quiz predictions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      debugInfo: 'Check server logs for detailed error information'
    });
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