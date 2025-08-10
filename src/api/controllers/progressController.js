const Progress = require('../models/progressModel');
const Course = require('../models/courseModel');
const connectDB = require('../mongodb');

class ProgressController {
    // Get all progress records
    static async getAllProgress(req, res) {
        try {
            await connectDB();
            const progress = await Progress.find();
            res.status(200).json(progress);
        } catch (error) {
            console.error('Error fetching progress:', error);
            res.status(500).json({ message: 'Failed to retrieve progress records' });
        }
    }

    // Get progress by ID
    static async getProgressById(req, res) {
        try {
            await connectDB();
            const progress = await Progress.findById(req.params.id);
            if (!progress) {
                return res.status(404).json({ message: 'Progress record not found' });
            }
            res.status(200).json(progress);
        } catch (error) {
            console.error('Error fetching progress by ID:', error);
            res.status(500).json({ message: 'Failed to retrieve progress record' });
        }
    }

    // Get progress by user ID
    static async getProgressByUserId(req, res) {
        try {
            await connectDB();
            const { user_id } = req.params;
            const progress = await Progress.find({ user_id });
            res.status(200).json(progress);
        } catch (error) {
            console.error('Error fetching progress by user ID:', error);
            res.status(500).json({ message: 'Failed to retrieve user progress' });
        }
    }

    // Get progress by course name
    static async getProgressByCourseName(req, res) {
        try {
            await connectDB();
            const { course_name } = req.params;
            const progress = await Progress.find({ course_name });
            res.status(200).json(progress);
        } catch (error) {
            console.error('Error fetching progress by course name:', error);
            res.status(500).json({ message: 'Failed to retrieve course progress' });
        }
    }

    // Get progress by assignment type
    static async getProgressByAssignmentType(req, res) {
        try {
            await connectDB();
            const { assignment_type } = req.params;
            const progress = await Progress.find({ assignment_type });
            res.status(200).json(progress);
        } catch (error) {
            console.error('Error fetching progress by assignment type:', error);
            res.status(500).json({ message: 'Failed to retrieve progress by type' });
        }
    }

    // Get progress by user ID and assignment type
    static async getProgressByUserAndType(req, res) {
        try {
            await connectDB();
            const { user_id, assignment_type } = req.params;
            const progress = await Progress.find({ 
                user_id, 
                assignment_type 
            });
            res.status(200).json(progress);
        } catch (error) {
            console.error('Error fetching progress by user and type:', error);
            res.status(500).json({ message: 'Failed to retrieve user progress by type' });
        }
    }

    // Get progress by course and assignment number
    static async getProgressByCourseAndAssignment(req, res) {
        try {
            await connectDB();
            const { course_name, assignment_number } = req.params;
            const progress = await Progress.find({ 
                course_name, 
                assignment_number 
            });
            res.status(200).json(progress);
        } catch (error) {
            console.error('Error fetching progress by course and assignment:', error);
            res.status(500).json({ message: 'Failed to retrieve course assignment progress' });
        }
    }

    // Get course completion percentage for a user
    // static async getCourseCompletionPercentage(req, res) {
    //     try {
    //         await connectDB();
    //         const { user_id, course_name } = req.params;

    //         // Get the course data to determine available assignments
    //         const course = await Course.findOne({ name: course_name });
    //         if (!course) {
    //             return res.status(404).json({ message: 'Course not found' });
    //         }

    //         // Get all progress records for this user and course
    //         const userProgress = await Progress.find({ 
    //             user_id, 
    //             course_name 
    //         });

    //         // Determine available assignments from course data
    //         const availableAssignments = {
    //             lessons: [],
    //             worksheets: [],
    //             quiz: false
    //         };

    //         // Check which lessons are available (lesson_1, lesson_2, etc.)
    //         for (let i = 1; i <= 5; i++) {
    //             if (course[`lesson_${i}`] === true) {
    //                 availableAssignments.lessons.push(i.toString());
    //             }
    //         }

    //         // Check which worksheets are available (ws_1, ws_2, etc.)
    //         for (let i = 1; i <= 5; i++) {
    //             if (course[`ws_${i}`] === true) {
    //                 availableAssignments.worksheets.push(i.toString());
    //             }
    //         }

    //         // Check if quiz is available
    //         if (course.quiz === true) {
    //             availableAssignments.quiz = true;
    //         }

    //         // Count completed assignments by type
    //         const completedAssignments = {
    //             lessons: 0,
    //             worksheets: 0,
    //             quiz: 0
    //         };

    //         // Count total expected assignments
    //         const totalAssignments = {
    //             lessons: availableAssignments.lessons.length,
    //             worksheets: availableAssignments.worksheets.length,
    //             quiz: availableAssignments.quiz ? 1 : 0
    //         };

    //         // Check each progress record
    //         userProgress.forEach(progress => {
    //             if (progress.progress && progress.progress.completed) {
    //                 if (progress.assignment_type === 'lesson') {
    //                     completedAssignments.lessons++;
    //                 } else if (progress.assignment_type === 'worksheet') {
    //                     completedAssignments.worksheets++;
    //                 } else if (progress.assignment_type === 'quiz') {
    //                     completedAssignments.quiz++;
    //                 }
    //             }
    //         });

    //         // Calculate totals
    //         const totalCompleted = completedAssignments.lessons + completedAssignments.worksheets + completedAssignments.quiz;
    //         const totalExpected = totalAssignments.lessons + totalAssignments.worksheets + totalAssignments.quiz;
    //         const completionPercentage = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    //         const result = {
    //             course_name,
    //             user_id,
    //             completion_percentage: completionPercentage,
    //             completed_assignments: totalCompleted,
    //             total_assignments: totalExpected,
    //             available_assignments: availableAssignments,
    //             breakdown: {
    //                 lessons: {
    //                     completed: completedAssignments.lessons,
    //                     total: totalAssignments.lessons,
    //                     available: availableAssignments.lessons
    //                 },
    //                 worksheets: {
    //                     completed: completedAssignments.worksheets,
    //                     total: totalAssignments.worksheets,
    //                     available: availableAssignments.worksheets
    //                 },
    //                 quiz: {
    //                     completed: completedAssignments.quiz,
    //                     total: totalAssignments.quiz,
    //                     available: availableAssignments.quiz
    //                 }
    //             },
    //             completed_assignments_list: userProgress
    //                 .filter(p => p.progress && p.progress.completed)
    //                 .map(p => ({
    //                     assignment_type: p.assignment_type,
    //                     assignment_number: p.assignment_number,
    //                     score: p.progress.score || null,
    //                     completed_at: p.updatedAt
    //                 }))
    //         };

    //         res.status(200).json(result);
    //     } catch (error) {
    //         console.error('Error calculating course completion percentage:', error);
    //         res.status(500).json({ message: 'Failed to calculate course completion percentage' });
    //     }
    // }

    // static async getCourseCompletionPercentage(req, res) {
    //     try {
    //         await connectDB();
    //         const { user_id, course_name } = req.params;
    
    //         console.log('=== DEBUG INFO ===');
    //         console.log('user_id:', user_id);
    //         console.log('course_name:', course_name);
    
    //         // Get the course data to determine available assignments
    //         console.log('Searching for course with name:', course_name);
    //         const course = await Course.findOne({ name: course_name });
    //         console.log('Found course with name field:', course);
    
    //         // Try with courseName field instead
    //         const courseByCourseName = await Course.findOne({ courseName: course_name });
    //         console.log('Found course with courseName field:', courseByCourseName);
    
    //         // List all courses to see what's available
    //         const allCourses = await Course.find({}, { _id: 1, name: 1, courseName: 1 });
    //         console.log('All available courses:', allCourses);
    
    //         if (!course && !courseByCourseName) {
    //             return res.status(404).json({ 
    //                 message: 'Course not found',
    //                 searchedFor: course_name,
    //                 availableCourses: allCourses
    //             });
    //         }
    
    //         const foundCourse = course || courseByCourseName;
    
    //         // Get all progress records for this user and course
    //         const userProgress = await Progress.find({ 
    //             user_id, 
    //             course_name 
    //         });
    
    //         // Determine available assignments from course data
    //         const availableAssignments = {
    //             lessons: [],
    //             worksheets: [],
    //             quiz: false
    //         };
    
    //         // Check which lessons are available (lesson_1, lesson_2, etc.)
    //         for (let i = 1; i <= 5; i++) {
    //             if (foundCourse[`lesson_${i}`] === true) {
    //                 availableAssignments.lessons.push(i.toString());
    //             }
    //         }
    
    //         // Check which worksheets are available (ws_1, ws_2, etc.)
    //         for (let i = 1; i <= 5; i++) {
    //             if (foundCourse[`ws_${i}`] === true) {
    //                 availableAssignments.worksheets.push(i.toString());
    //             }
    //         }
    
    //         // Check if quiz is available
    //         if (foundCourse.quiz === true) {
    //             availableAssignments.quiz = true;
    //         }
    
    //         // Count completed assignments by type
    //         const completedAssignments = {
    //             lessons: 0,
    //             worksheets: 0,
    //             quiz: 0
    //         };
    
    //         // Count total expected assignments
    //         const totalAssignments = {
    //             lessons: availableAssignments.lessons.length,
    //             worksheets: availableAssignments.worksheets.length,
    //             quiz: availableAssignments.quiz ? 1 : 0
    //         };
    
    //         // Check each progress record
    //         userProgress.forEach(progress => {
    //             if (progress.progress && progress.progress.completed) {
    //                 if (progress.assignment_type === 'lesson') {
    //                     completedAssignments.lessons++;
    //                 } else if (progress.assignment_type === 'worksheet') {
    //                     completedAssignments.worksheets++;
    //                 } else if (progress.assignment_type === 'quiz') {
    //                     completedAssignments.quiz++;
    //                 }
    //             }
    //         });
    
    //         // Calculate totals
    //         const totalCompleted = completedAssignments.lessons + completedAssignments.worksheets + completedAssignments.quiz;
    //         const totalExpected = totalAssignments.lessons + totalAssignments.worksheets + totalAssignments.quiz;
    //         const completionPercentage = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
    
    //         const result = {
    //             course_name,
    //             user_id,
    //             completion_percentage: completionPercentage,
    //             completed_assignments: totalCompleted,
    //             total_assignments: totalExpected,
    //             available_assignments: availableAssignments,
    //             breakdown: {
    //                 lessons: {
    //                     completed: completedAssignments.lessons,
    //                     total: totalAssignments.lessons,
    //                     available: availableAssignments.lessons
    //                 },
    //                 worksheets: {
    //                     completed: completedAssignments.worksheets,
    //                     total: totalAssignments.worksheets,
    //                     available: availableAssignments.worksheets
    //                 },
    //                 quiz: {
    //                     completed: completedAssignments.quiz,
    //                     total: totalAssignments.quiz,
    //                     available: availableAssignments.quiz
    //                 }
    //             },
    //             completed_assignments_list: userProgress
    //                 .filter(p => p.progress && p.progress.completed)
    //                 .map(p => ({
    //                     assignment_type: p.assignment_type,
    //                     assignment_number: p.assignment_number,
    //                     score: p.progress.score || null,
    //                     completed_at: p.updatedAt
    //                 }))
    //         };
    
    //         res.status(200).json(result);
    //     } catch (error) {
    //         console.error('Error calculating course completion percentage:', error);
    //         res.status(500).json({ message: 'Failed to calculate course completion percentage' });
    //     }
    // }

    static async getCourseCompletionPercentage(req, res) {
    try {
        await connectDB();
        const { user_id, course_name } = req.params;

        console.log('=== DEBUG INFO ===');
        console.log('user_id:', user_id);
        console.log('course_name:', course_name);

        // Get the course data - use courseName field and try both cases
        let course = await Course.findOne({ courseName: course_name });
        if (!course) {
            // Try case-insensitive search
            course = await Course.findOne({ 
                courseName: { $regex: new RegExp(`^${course_name}$`, 'i') } 
            });
        }

        console.log('Found course:', course);

        if (!course) {
            const allCourses = await Course.find({}, { courseName: 1, _id: 1 });
            console.log('Available courses:', allCourses);
            
            return res.status(404).json({ 
                message: 'Course not found',
                searchedFor: course_name,
                availableCourses: allCourses.map(c => c.courseName)
            });
        }

        // Get all progress records for this user and course (try both cases)
        let userProgress = await Progress.find({ 
            user_id, 
            course_name 
        });

        // If no progress found, try with the course name from the database
        if (userProgress.length === 0) {
            userProgress = await Progress.find({ 
                user_id, 
                course_name: course.courseName 
            });
        }

        // Also try case-insensitive search for progress
        if (userProgress.length === 0) {
            userProgress = await Progress.find({ 
                user_id, 
                course_name: { $regex: new RegExp(`^${course_name}$`, 'i') }
            });
        }

        console.log('Found progress records:', userProgress);

        // Get student responses for this user and course
        const studentResponses = await StudentResponse.findOne({
            studentId: user_id,
            courseId: course_name
        });

        console.log('Found student responses:', studentResponses);

        // Determine available assignments from course data
        const availableAssignments = {
            lessons: [],
            worksheets: [],
            quiz: false
        };

        // Use the lessons array length to determine available lessons
        if (course.lessons && Array.isArray(course.lessons)) {
            for (let i = 1; i <= course.lessons.length; i++) {
                availableAssignments.lessons.push(i.toString());
            }
        }

        // If you have worksheets array, use it (adjust based on your schema)
        if (course.worksheets && Array.isArray(course.worksheets)) {
            for (let i = 1; i <= course.worksheets.length; i++) {
                availableAssignments.worksheets.push(i.toString());
            }
        } else {
            // Fallback: assume each lesson has a worksheet
            for (let i = 1; i <= (course.lessons?.length || 0); i++) {
                availableAssignments.worksheets.push(i.toString());
            }
        }

        // Check if quiz is available (adjust field name based on your schema)
        if (course.quiz === true || course.hasQuiz === true) {
            availableAssignments.quiz = true;
        }

        console.log('Available assignments:', availableAssignments);

        // Count completed assignments by type
        const completedAssignments = {
            lessons: 0,
            worksheets: 0,
            quiz: 0
        };

        // Count total expected assignments
        const totalAssignments = {
            lessons: availableAssignments.lessons.length,
            worksheets: availableAssignments.worksheets.length,
            quiz: availableAssignments.quiz ? 1 : 0
        };

        // Check each progress record
        userProgress.forEach(progress => {
            console.log('Processing progress:', progress);
            if (progress.progress && progress.progress.completed) {
                if (progress.assignment_type === 'lesson') {
                    completedAssignments.lessons++;
                } else if (progress.assignment_type === 'worksheet') {
                    completedAssignments.worksheets++;
                } else if (progress.assignment_type === 'quiz') {
                    completedAssignments.quiz++;
                }
            }
        });

        // Calculate totals
        const totalCompleted = completedAssignments.lessons + completedAssignments.worksheets + completedAssignments.quiz;
        const totalExpected = totalAssignments.lessons + totalAssignments.worksheets + totalAssignments.quiz;
        const completionPercentage = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

        // Create detailed assignment list with student responses
        const detailedAssignments = [];

        // Add lessons with responses
        availableAssignments.lessons.forEach(lessonNum => {
            const progressRecord = userProgress.find(p => 
                p.assignment_type === 'lesson' && p.assignment_number === lessonNum
            );
            
            const lessonResponse = studentResponses?.responses?.find(r => 
                r.lessonId === lessonNum || r.lessonId === `lesson_${lessonNum}`
            );

            detailedAssignments.push({
                assignment_type: 'lesson',
                assignment_number: lessonNum,
                isCompleted: progressRecord?.progress?.completed || false,
                progress: progressRecord?.progress || null,
                studentResponse: lessonResponse || null,
                score: progressRecord?.progress?.score || null,
                completed_at: progressRecord?.updatedAt || null
            });
        });

        // Add worksheets with responses
        availableAssignments.worksheets.forEach(worksheetNum => {
            const progressRecord = userProgress.find(p => 
                p.assignment_type === 'worksheet' && p.assignment_number === worksheetNum
            );
            
            const worksheetResponse = studentResponses?.responses?.find(r => 
                r.worksheet?.worksheetId === worksheetNum || r.worksheet?.worksheetId === `worksheet_${worksheetNum}`
            );

            detailedAssignments.push({
                assignment_type: 'worksheet',
                assignment_number: worksheetNum,
                isCompleted: progressRecord?.progress?.completed || false,
                progress: progressRecord?.progress || null,
                studentResponse: worksheetResponse?.worksheet || null,
                score: progressRecord?.progress?.score || null,
                completed_at: progressRecord?.updatedAt || null
            });
        });

        // Add quiz with responses
        if (availableAssignments.quiz) {
            const progressRecord = userProgress.find(p => p.assignment_type === 'quiz');
            const quizResponses = studentResponses?.responses?.find(r => r.quiz && r.quiz.length > 0);

            detailedAssignments.push({
                assignment_type: 'quiz',
                assignment_number: '1',
                isCompleted: progressRecord?.progress?.completed || false,
                progress: progressRecord?.progress || null,
                studentResponse: quizResponses?.quiz || null,
                score: progressRecord?.progress?.score || null,
                completed_at: progressRecord?.updatedAt || null
            });
        }

        const result = {
            course_name,
            user_id,
            completion_percentage: completionPercentage,
            completed_assignments: totalCompleted,
            total_assignments: totalExpected,
            available_assignments: availableAssignments,
            detailed_assignments: detailedAssignments, // New field with responses
            breakdown: {
                lessons: {
                    completed: completedAssignments.lessons,
                    total: totalAssignments.lessons,
                    available: availableAssignments.lessons
                },
                worksheets: {
                    completed: completedAssignments.worksheets,
                    total: totalAssignments.worksheets,
                    available: availableAssignments.worksheets
                },
                quiz: {
                    completed: completedAssignments.quiz,
                    total: totalAssignments.quiz,
                    available: availableAssignments.quiz
                }
            },
            completed_assignments_list: userProgress
                .filter(p => p.progress && p.progress.completed)
                .map(p => ({
                    assignment_type: p.assignment_type,
                    assignment_number: p.assignment_number,
                    score: p.progress.score || null,
                    completed_at: p.updatedAt
                }))
        };

        console.log('Final result:', result);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error calculating course completion percentage:', error);
        res.status(500).json({ message: 'Failed to calculate course completion percentage' });
    }
}

    // Create new progress record
    static async createProgress(req, res) {
        try {
            await connectDB();
            const { course_name, assignment_type, assignment_number, user_id, progress } = req.body;

            // Validate required fields
            if (!course_name || !assignment_type || !assignment_number || !user_id || !progress) {
                return res.status(400).json({ 
                    message: 'Missing required fields: course_name, assignment_type, assignment_number, user_id, progress' 
                });
            }

            // Check if progress record already exists for this user, course, and assignment
            const existingProgress = await Progress.findOne({ 
                course_name,
                assignment_type,
                assignment_number,
                user_id 
            });

            if (existingProgress) {
                return res.status(409).json({ 
                    message: 'Progress record already exists for this user, course, and assignment' 
                });
            }

            const newProgress = new Progress({
                course_name,
                assignment_type,
                assignment_number,
                user_id,
                progress
            });

            await newProgress.save();
            res.status(201).json(newProgress);
        } catch (error) {
            console.error('Error creating progress:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    message: 'Validation error', 
                    error: error.message 
                });
            }
            res.status(500).json({ message: 'Failed to create progress record' });
        }
    }

    // Update progress record
    static async updateProgress(req, res) {
        try {
            await connectDB();
            const { id } = req.params;
            const updateData = req.body;

            // Validate assignment_type if it's being updated
            if (updateData.assignment_type && 
                !['worksheet', 'lesson', 'quiz'].includes(updateData.assignment_type)) {
                return res.status(400).json({ 
                    message: 'Invalid assignment_type. Must be one of: worksheet, lesson, quiz' 
                });
            }

            const updatedProgress = await Progress.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedProgress) {
                return res.status(404).json({ message: 'Progress record not found' });
            }

            res.status(200).json(updatedProgress);
        } catch (error) {
            console.error('Error updating progress:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    message: 'Validation error', 
                    error: error.message 
                });
            }
            res.status(500).json({ message: 'Failed to update progress record' });
        }
    }

    // Update progress data (partial update)
    static async updateProgressData(req, res) {
        try {
            await connectDB();
            const { id } = req.params;
            const { progress } = req.body;

            if (!progress) {
                return res.status(400).json({ message: 'Progress data is required' });
            }

            const updatedProgress = await Progress.findByIdAndUpdate(
                id,
                { progress },
                { new: true }
            );

            if (!updatedProgress) {
                return res.status(404).json({ message: 'Progress record not found' });
            }

            res.status(200).json(updatedProgress);
        } catch (error) {
            console.error('Error updating progress data:', error);
            res.status(500).json({ message: 'Failed to update progress data' });
        }
    }

    // Delete progress record
    static async deleteProgress(req, res) {
        try {
            await connectDB();
            const { id } = req.params;
            const deletedProgress = await Progress.findByIdAndDelete(id);

            if (!deletedProgress) {
                return res.status(404).json({ message: 'Progress record not found' });
            }

            res.status(200).json({ 
                message: 'Progress record deleted successfully',
                deletedRecord: deletedProgress
            });
        } catch (error) {
            console.error('Error deleting progress:', error);
            res.status(500).json({ message: 'Failed to delete progress record' });
        }
    }

    // Delete all progress for a user
    static async deleteUserProgress(req, res) {
        try {
            await connectDB();
            const { user_id } = req.params;
            const result = await Progress.deleteMany({ user_id });

            res.status(200).json({ 
                message: `Deleted ${result.deletedCount} progress records for user`,
                deletedCount: result.deletedCount
            });
        } catch (error) {
            console.error('Error deleting user progress:', error);
            res.status(500).json({ message: 'Failed to delete user progress' });
        }
    }

    // Get progress statistics for a user
    static async getUserProgressStats(req, res) {
        try {
            await connectDB();
            const { user_id } = req.params;

            const userProgress = await Progress.find({ user_id });
            
            const stats = {
                totalAssignments: userProgress.length,
                byType: {
                    worksheet: userProgress.filter(p => p.assignment_type === 'worksheet').length,
                    lesson: userProgress.filter(p => p.assignment_type === 'lesson').length,
                    quiz: userProgress.filter(p => p.assignment_type === 'quiz').length
                },
                byCourse: {},
                completed: userProgress.filter(p => p.progress?.completed).length,
                inProgress: userProgress.filter(p => p.progress?.inProgress && !p.progress?.completed).length
            };

            // Group by course
            userProgress.forEach(p => {
                if (!stats.byCourse[p.course_name]) {
                    stats.byCourse[p.course_name] = 0;
                }
                stats.byCourse[p.course_name]++;
            });

            res.status(200).json(stats);
        } catch (error) {
            console.error('Error fetching user progress stats:', error);
            res.status(500).json({ message: 'Failed to retrieve user progress statistics' });
        }
    }

    // Bulk create progress records
    static async bulkCreateProgress(req, res) {
        try {
            await connectDB();
            const { progressRecords } = req.body;

            if (!Array.isArray(progressRecords) || progressRecords.length === 0) {
                return res.status(400).json({ 
                    message: 'progressRecords must be a non-empty array' 
                });
            }

            // Validate each record
            for (const record of progressRecords) {
                if (!record.course_name || !record.assignment_type || !record.assignment_number || !record.user_id || !record.progress) {
                    return res.status(400).json({ 
                        message: 'Each record must have course_name, assignment_type, assignment_number, user_id, and progress' 
                    });
                }
            }

            const createdProgress = await Progress.insertMany(progressRecords);
            res.status(201).json({
                message: `Created ${createdProgress.length} progress records`,
                records: createdProgress
            });
        } catch (error) {
            console.error('Error bulk creating progress:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    message: 'Validation error in bulk create', 
                    error: error.message 
                });
            }
            res.status(500).json({ message: 'Failed to bulk create progress records' });
        }
    }
}

module.exports = ProgressController;
