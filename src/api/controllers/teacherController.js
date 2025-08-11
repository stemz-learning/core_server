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

  // get the quiz predictions

const getQuizPredictions = async (req, res) => {
  try {
    console.log("=== Quiz Predictions Debug Start ===");
    const { studentId } = req.params;
    console.log("StudentId:", studentId);

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const TEST_DUMMY_RESPONSE = false;  // << Set true to skip heavy logic & return dummy immediately

    if (TEST_DUMMY_RESPONSE) {
      console.log("Sending dummy response for quick testing...");
      return res.status(200).json({
        success: true,
        studentId,
        studentName: "Dummy Student",
        inputScores: [85, 90],
        predictions: {
          predicted_scores: [92, 95, 98]
        },
        completedQuizzes: 2,
        totalQuizzesExpected: 5,
        chartData: [
          { quiz: 'Quiz 1', type: 'Completed', score: 85 },
          { quiz: 'Quiz 2', type: 'Completed', score: 90 },
          { quiz: 'Quiz 3', type: 'Predicted', score: 92 },
          { quiz: 'Quiz 4', type: 'Predicted', score: 95 },
          { quiz: 'Quiz 5', type: 'Predicted', score: 98 },
        ],
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
      console.log("No student responses found");
      return res.status(404).json({
        success: false,
        message: 'No response data found for this student'
      });
    }

    // Extract all quiz scores
    const allQuizzes = [];
    console.log("Processing responses...");
    studentResponses.forEach((courseResponse, index) => {
      console.log(`Course ${index + 1} - CourseId:`, courseResponse.courseId);
      console.log(`Course ${index + 1} - Responses:`, courseResponse.responses?.length || 0);

      if (!courseResponse.responses || courseResponse.responses.length === 0) {
        console.log(`Course ${index + 1} - No responses found`);
        return;
      }

      const courseQuizzes = courseResponse.responses
        .filter(response => {
          const hasQuiz = response.quiz && Array.isArray(response.quiz) && response.quiz.length > 0;
          console.log(`  Response lessonId: ${response.lessonId}, has quiz: ${hasQuiz}, quiz length: ${response.quiz?.length || 0}`);
          return hasQuiz;
        })
        .map(response => {
          try {
            const correctAnswers = response.quiz.filter(answer =>
              answer.isCorrect === true || answer.correct === true
            ).length;
            const totalQuestions = response.quiz.length;
            const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

            console.log(`  Quiz: ${correctAnswers}/${totalQuestions} = ${score.toFixed(2)}%`);

            return {
              courseId: courseResponse.courseId,
              lessonId: response.lessonId,
              score: Math.round(score * 100) / 100, // Round to 2 decimals
              completedAt: response.completedAt || courseResponse.updatedAt || new Date(),
              totalQuestions,
              correctAnswers
            };
          } catch (error) {
            console.log(`  Error processing quiz for lesson ${response.lessonId}:`, error.message);
            return null;
          }
        })
        .filter(quiz => quiz !== null);

      console.log(`Course ${index + 1} - Valid quizzes found:`, courseQuizzes.length);
      allQuizzes.push(...courseQuizzes);
    });

    console.log("Total quizzes found:", allQuizzes.length);

    allQuizzes.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    console.log("Sorted quizzes:", allQuizzes.map(q => ({
      lessonId: q.lessonId,
      score: q.score,
      completedAt: q.completedAt
    })));

    if (allQuizzes.length < 2) {
      console.log("Not enough quizzes for prediction");
      return res.status(400).json({
        success: false,
        message: 'Student needs to complete at least 2 quizzes across all courses for predictions',
        completedQuizzes: allQuizzes.length,
        requiredQuizzes: 2,
        availableQuizzes: allQuizzes.map(q => ({
          lessonId: q.lessonId,
          score: q.score
        }))
      });
    }

    const inputScores = allQuizzes.slice(0, 2).map(quiz => quiz.score);
    console.log("Input scores for prediction:", inputScores);

    const scoresString = inputScores.join(',');
    console.log("Scores string:", scoresString);

    const GRADIO_API_URL = 'https://sri-chandrasekaran-flask-nlp-api.hf.space';
    console.log("Calling Gradio API...");

    // Step 1: POST request to get event_id
    const postResponse = await Promise.race([
      fetch(`${GRADIO_API_URL}/gradio_api/call/predict_future`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [scoresString] }),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000)),
    ]);

    console.log("Gradio POST response status:", postResponse.status);

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.log("Gradio POST error:", errorText);
      throw new Error(`Gradio API POST error: ${postResponse.status} - ${errorText}`);
    }

    const text = await postResponse.text();
    console.log("Raw POST response text:", text);

    let postData;
    try {
      postData = JSON.parse(text);
      console.log("Parsed POST data:", postData);
    } catch (err) {
      console.error("Failed to parse JSON from POST response:", err);
      throw new Error("Invalid JSON response from prediction service");
    }

    if (!postData.event_id) {
      throw new Error('No event_id received from Gradio API');
    }

    const eventId = postData.event_id;

    // Step 2: GET request to retrieve results with retry logic
    console.log("Getting results with event ID:", eventId);
    let getResponse;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      getResponse = await Promise.race([
        fetch(`${GRADIO_API_URL}/gradio_api/call/predict_future/${eventId}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('GET request timeout')), 10000)),
      ]);

      console.log(`Gradio GET attempt ${attempts + 1}, response status:`, getResponse.status);

      if (getResponse.ok) {
        const rawText = await getResponse.text();
        console.log("Raw GET response text:", rawText);

        const dataLines = rawText.split('\n').filter(line => line.startsWith('data: '));
        if (dataLines.length === 0) {
          console.log("No data lines found in SSE response");
        } else {
          const lastDataLine = dataLines[dataLines.length - 1];
          const jsonStr = lastDataLine.replace(/^data: /, '').trim();
          try {
            const resultData = JSON.parse(jsonStr);
            console.log("Parsed prediction data:", resultData);

            if (resultData.data && resultData.data[0]) {
              const predictionData = resultData.data[0];

              if (!predictionData.predicted_scores || !Array.isArray(predictionData.predicted_scores)) {
                throw new Error('Invalid prediction data structure received');
              }

              const studentInfo = studentResponses[0].studentId;

              const responseData = {
                success: true,
                studentId: studentInfo._id,
                studentName: studentInfo.name,
                inputScores,
                predictions: predictionData,
                completedQuizzes: allQuizzes.length,
                totalQuizzesExpected: 5,
                chartData: [
                  { quiz: 'Quiz 1', type: 'Completed', score: Math.round(inputScores[0]) },
                  { quiz: 'Quiz 2', type: 'Completed', score: Math.round(inputScores[1]) },
                  ...predictionData.predicted_scores.map((score, index) => ({
                    quiz: `Quiz ${index + 3}`,
                    type: 'Predicted',
                    score: Math.round(score),
                  })),
                ],
              };

              console.log("=== Quiz Predictions Debug End ===");
              return res.status(200).json(responseData);
            }
          } catch (err) {
            console.error("Failed to parse prediction JSON from SSE:", err);
          }
        }
      }

      attempts++;
      console.log(`Attempt ${attempts} failed, retrying...`);
    }

    throw new Error('Failed to get results after maximum attempts');

  } catch (error) {
    console.error('=== ERROR in getQuizPredictions ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: 'Prediction service request timeout',
        error: 'The prediction service is taking too long to respond',
      });
    }

    if (error.message.includes('Gradio API') || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Prediction service temporarily unavailable',
        error: 'Please ensure the Gradio service is running',
      });
    }

    if (error.message.includes('No event_id') || error.message.includes('Invalid prediction data')) {
      return res.status(502).json({
        success: false,
        message: 'Invalid response from prediction service',
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to get quiz predictions',
      error: error.message,
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