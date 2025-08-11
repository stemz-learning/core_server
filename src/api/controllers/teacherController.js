const StudentResponse = require('../models/studentResponseSchema');
const User = require('../models/userModel');

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

  // // get the quiz predictions
  // const getQuizPredictions = async (req, res) => {
  //   try {
  //     console.log("=== Quiz Predictions Debug Start ===");
  //     const { studentId } = req.params;
  //     console.log("StudentId:", studentId);
  
  //     // Get ALL student responses across ALL courses
  //     const studentResponses = await StudentResponse.find({ studentId })
  //       .populate('studentId', 'name email');
  
  //     console.log("Found student responses:", studentResponses?.length || 0);
  
  //     if (!studentResponses || studentResponses.length === 0) {
  //       console.log("No student responses found");
  //       return res.status(404).json({ 
  //         message: 'No response data found for this student' 
  //       });
  //     }
  
  //     // Extract ALL quiz scores across ALL courses, sorted chronologically
  //     const allQuizzes = [];
      
  //     console.log("Processing responses...");
  //     studentResponses.forEach((courseResponse, index) => {
  //       console.log(`Course ${index + 1} - CourseId:`, courseResponse.courseId);
  //       console.log(`Course ${index + 1} - Responses:`, courseResponse.responses?.length || 0);
        
  //       const courseQuizzes = courseResponse.responses
  //         .filter(response => {
  //           const hasQuiz = response.quiz && response.quiz.length > 0;
  //           console.log(`  Response has quiz: ${hasQuiz}, quiz length: ${response.quiz?.length || 0}`);
  //           return hasQuiz;
  //         })
  //         .map(response => {
  //           const correctAnswers = response.quiz.filter(answer => 
  //             answer.isCorrect || answer.correct
  //           ).length;
  //           const score = (correctAnswers / response.quiz.length) * 100;
            
  //           console.log(`  Quiz: ${correctAnswers}/${response.quiz.length} = ${score}%`);
            
  //           return {
  //             courseId: courseResponse.courseId,
  //             lessonId: response.lessonId,
  //             score: score,
  //             completedAt: response.completedAt || courseResponse.updatedAt
  //           };
  //         });
        
  //       console.log(`Course ${index + 1} - Valid quizzes found:`, courseQuizzes.length);
  //       allQuizzes.push(...courseQuizzes);
  //     });
  
  //     console.log("Total quizzes found:", allQuizzes.length);
  
  //     // Sort all quizzes chronologically
  //     allQuizzes.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  
  //     if (allQuizzes.length < 2) {
  //       console.log("Not enough quizzes for prediction");
  //       return res.status(400).json({
  //         message: 'Student needs to complete at least 2 quizzes across all courses for predictions',
  //         completedQuizzes: allQuizzes.length,
  //         requiredQuizzes: 2
  //       });
  //     }
  
  //     // Take first 2 quiz scores for prediction
  //     const inputScores = allQuizzes.slice(0, 2).map(quiz => quiz.score);
  //     console.log("Input scores for prediction:", inputScores);
      
  //     const scoresString = inputScores.join(',');
  //     console.log("Scores string:", scoresString);
  
  //     // Call Gradio API (same as before)
  //     const GRADIO_API_URL = 'https://sri-chandrasekaran-flask-nlp-api.hf.space';
  //     console.log("Calling Gradio API...");
      
  //     // Step 1: POST request to get EVENT_ID
  //     const postResponse = await fetch(`${GRADIO_API_URL}/gradio_api/call/predict_future`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ data: [scoresString] })
  //     });
  
  //     console.log("Gradio POST response status:", postResponse.status);
  
  //     if (!postResponse.ok) {
  //       const errorText = await postResponse.text();
  //       console.log("Gradio POST error:", errorText);
  //       throw new Error(`Gradio API error: ${postResponse.status} - ${errorText}`);
  //     }
  
  //     const postData = await postResponse.json();
  //     console.log("Gradio POST data:", postData);
  //     const eventId = postData.event_id;
  
  //     // Step 2: GET request to retrieve results
  //     console.log("Getting results with event ID:", eventId);
  //     const getResponse = await fetch(`${GRADIO_API_URL}/gradio_api/call/predict_future/${eventId}`);
      
  //     console.log("Gradio GET response status:", getResponse.status);
  
  //     if (!getResponse.ok) {
  //       const errorText = await getResponse.text();
  //       console.log("Gradio GET error:", errorText);
  //       throw new Error(`Gradio API error: ${getResponse.status} - ${errorText}`);
  //     }
  
  //     const resultData = await getResponse.json();
  //     console.log("Gradio result data:", resultData);
  //     const predictionData = resultData.data[0];
  
  //     // Get student info from first response
  //     const studentInfo = studentResponses[0].studentId;
  
  //     console.log("Prediction successful, formatting response...");
  
  //     // Format response with generic quiz labels
  //     const responseData = {
  //       success: true,
  //       studentId: studentInfo._id,
  //       studentName: studentInfo.name,
  //       inputScores,
  //       predictions: predictionData,
  //       completedQuizzes: allQuizzes.length,
  //       totalQuizzesExpected: 5,
  //       chartData: [
  //         { quiz: 'Quiz 1', type: 'Completed', score: Math.round(inputScores[0]) },
  //         { quiz: 'Quiz 2', type: 'Completed', score: Math.round(inputScores[1]) },
  //         ...predictionData.predicted_scores.map((score, index) => ({
  //           quiz: `Quiz ${index + 3}`,
  //           type: 'Predicted',
  //           score: Math.round(score)
  //         }))
  //       ]
  //     };
  
  //     console.log("=== Quiz Predictions Debug End ===");
  //     return res.status(200).json(responseData);
  
  //   } catch (error) {
  //     console.error('=== ERROR in getQuizPredictions ===');
  //     console.error('Error message:', error.message);
  //     console.error('Error stack:', error.stack);
      
  //     // Handle Gradio API connection errors gracefully
  //     if (error.message.includes('Gradio API') || error.code === 'ECONNREFUSED') {
  //       return res.status(503).json({
  //         message: 'Prediction service temporarily unavailable',
  //         error: 'Please ensure the Gradio service is running'
  //       });
  //     }
  
  //     return res.status(500).json({
  //       message: 'Failed to get quiz predictions',
  //       error: error.message
  //     });
  //   }
  // };

  const getQuizPredictions = async (req, res) => {
    console.log("TEST: Function called!");
    return res.status(200).json({
      success: true,
      message: "Route is working!",
      studentId: req.params.studentId
    });
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