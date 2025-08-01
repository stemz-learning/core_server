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
      const { studentId } = req.params; // Student ID from params

      // Find the student's response data across all courses
      const studentResponse = await StudentResponse.findOne({ studentId }).populate('studentId', 'name email');

      if (!studentResponse) {
          return res.status(404).json({
              message: 'No response data found for this student'
          });
      }

      // Initialize the array to store all responses
      const allResponses = [];

      // Loop through all responses and collect BPQ scores
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

      // Calculate the average scores across all responses for this student
      const avgScores = {
          Creativity: 0,
          "Critical Thinking": 0,
          Observation: 0,
          Curiosity: 0,
          "Problem Solving": 0
      };

      if (allResponses.length > 0) {
          const totals = { ...avgScores };

          allResponses.forEach(response => {
              Object.keys(totals).forEach(skill => {
                  totals[skill] += response.scores[skill] || 0;
              });
          });

          Object.keys(avgScores).forEach(skill => {
              avgScores[skill] = Math.round(totals[skill] / allResponses.length);
          });
      }

      return res.status(200).json({
          success: true,
          studentId,
          averageScores: avgScores,  // This gives the overall average score
          allResponses,               // This contains all the detailed responses
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
  

module.exports = {
  getStudentBPQResponses,
  getIndividualStudentResponses,
  getStudentAnalyticsScores,
  getStudentOverallScores,
  getStudentCourseScores
};