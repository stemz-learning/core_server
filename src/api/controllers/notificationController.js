const Notification = require("../models/notificationModel");
const Assignment = require("../models/assignmentModel");
const PhysicalClassroom = require("../models/physicalClassroomModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const fs = require('fs').promises;
const path = require('path');

class NotificationController {
  // Get notifications for a user (student perspective)
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { includeDismissed = false, type, limit } = req.query;

      const options = {
        includeDismissed: includeDismissed === "true",
        type,
        limit: limit ? parseInt(limit) : 50,
      };

      const notifications = await Notification.findForStudent(userId, options);

      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      res.status(500).json({
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  }

  // Get notifications for teacher (physical classroom perspective)
  static async getClassroomNotifications(req, res) {
    try {
      const { classroomId } = req.params;
      const userId = req.user.id;

      // Verify user is teacher of this physical classroom
      const classroom = await PhysicalClassroom.findById(classroomId);
      if (!classroom) {
        return res
          .status(404)
          .json({ message: "Physical classroom not found" });
      }

      if (classroom.teacherId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get notifications for this classroom
      const notifications = await Notification.find({
        physicalClassroomId: classroomId,
        isActive: true,
      })
        .populate("senderId", "name")
        .populate("recipientId", "name email")
        .populate("assignmentId", "title")
        .sort({ createdAt: -1 });

      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching classroom notifications:", error);
      res.status(500).json({
        message: "Failed to fetch classroom notifications",
        error: error.message,
      });
    }
  }

  // Create announcement (teacher sends to all students in physical classroom)
  static async createAnnouncement(req, res) {
    try {
      const {
        physicalClassroomId,
        title,
        message,
        priority = "medium",
      } = req.body;
      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify classroom exists and user is the teacher
      const classroom = await PhysicalClassroom.findById(physicalClassroomId);
      if (!classroom) {
        return res
          .status(404)
          .json({ message: "Physical classroom not found" });
      }

      if (classroom.teacherId.toString() !== teacherId) {
        return res
          .status(403)
          .json({
            message: "Only the classroom teacher can create announcements",
          });
      }

      // Create announcement notifications for all students
      const announcementData = {
        senderId: teacherId,
        title,
        message,
        priority,
      };

      const notifications = await Notification.createAnnouncementNotifications(
        announcementData,
        physicalClassroomId
      );

      res.status(201).json({
        message: "Announcement created successfully",
        notificationCount: notifications.length,
        notifications: notifications.slice(0, 3), // Show first 3 as sample
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({
        message: "Failed to create announcement",
        error: error.message,
      });
    }
  }

  // Create assignment notification (called by assignment controller)
  static async createAssignmentNotification(req, res) {
    try {
      const {
        physicalClassroomId,
        title,
        description,
        course,
        lesson,
        activityType,
        activityTitle,
        dueDate,
        priority = "medium",
      } = req.body;
      const teacherId = req.user?.id;

      if (!teacherId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify classroom exists
      const classroom = await PhysicalClassroom.findById(physicalClassroomId);
      if (!classroom) {
        return res
          .status(404)
          .json({ message: "Physical classroom not found" });
      }

      if (classroom.teacherId.toString() !== teacherId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // First create the assignment
      const assignment = new Assignment({
        physicalClassroomId,
        teacherId,
        title,
        description,
        course,
        lesson,
        activityType,
        activityTitle,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
      });

      await assignment.save();

      // Then create notifications for all students
      const notifications = await Notification.createAssignmentNotifications(
        assignment,
        physicalClassroomId
      );

      res.status(201).json({
        message: "Assignment and notifications created successfully",
        assignment,
        notificationCount: notifications.length,
      });
    } catch (error) {
      console.error("Error creating assignment notification:", error);
      res.status(500).json({
        message: "Failed to create assignment notification",
        error: error.message,
      });
    }
  }

  // Create quiz failure notification (called automatically by system)
  static async createQuizFailureNotification(req, res) {
    try {
      const { studentId, course, lesson, activityTitle, score, maxScore } =
        req.body;

      // Calculate score percentage
      const scorePercent =
        maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const failureType = scorePercent < 50 ? "red" : "yellow";

      // Find all physical classrooms this student is in
      const studentClassrooms = await PhysicalClassroom.find({
        studentIds: studentId,
        isActive: true,
      }).populate("teacherId", "name");

      // Get student info
      const student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Create failure notification for each classroom teacher
      const notifications = [];
      for (const classroom of studentClassrooms) {
        const notification = new Notification({
          type: "quiz_failure",
          title: `Quiz Alert: ${student.name}`,
          message: `${student.name} scored ${scorePercent}% on ${activityTitle} in ${course}`,
          senderId: studentId, // Technically triggered by student action
          recipientId: classroom.teacherId._id, // Send to teacher
          physicalClassroomId: classroom._id,
          targetCourse: course,
          targetLesson: lesson,
          targetActivity: "quiz",
          quizFailureDetails: {
            score,
            maxScore,
            scorePercent,
            failureType,
          },
          priority: failureType === "red" ? "high" : "medium",
        });

        await notification.save();
        notifications.push(notification);
      }

      res.status(201).json({
        message: "Quiz failure notifications created",
        notificationCount: notifications.length,
        notifications,
      });
    } catch (error) {
      console.error("Error creating quiz failure notification:", error);
      res.status(500).json({
        message: "Failed to create quiz failure notification",
        error: error.message,
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Verify user is the recipient
      if (notification.recipientId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await notification.markAsRead();

      res.status(200).json({
        message: "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        message: "Failed to mark notification as read",
        error: error.message,
      });
    }
  }

  // Dismiss notification (student marks as dismissed)
  static async dismissNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Verify user is the recipient
      if (notification.recipientId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await notification.dismiss();

      res.status(200).json({
        message: "Notification dismissed",
      });
    } catch (error) {
      console.error("Error dismissing notification:", error);
      res.status(500).json({
        message: "Failed to dismiss notification",
        error: error.message,
      });
    }
  }

// Teacher dismisses notification from their classroom
static async teacherDismissNotification(req, res) {
  try {
    const { notificationId } = req.params;
    const teacherId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Verify teacher owns the classroom this notification belongs to
    const classroom = await PhysicalClassroom.findById(notification.physicalClassroomId);
    if (!classroom || classroom.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await notification.dismiss();

    res.status(200).json({
      message: "Notification dismissed",
    });
  } catch (error) {
    console.error("Error dismissing notification:", error);
    res.status(500).json({
      message: "Failed to dismiss notification",
      error: error.message,
    });
  }
}

  // Clear all notifications for a user
  static async clearAllNotifications(req, res) {
    try {
      const userId = req.user.id;

      // Mark all active notifications for this user as dismissed
      const result = await Notification.updateMany(
        {
          recipientId: userId,
          isActive: true,
          isDismissed: false,
        },
        {
          isDismissed: true,
          dismissedAt: new Date(),
          updatedAt: new Date(),
        }
      );

      res.status(200).json({
        message: "All notifications cleared",
        clearedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      res.status(500).json({
        message: "Failed to clear all notifications",
        error: error.message,
      });
    }
  }

  // Get notification summary for student dashboard
  static async getNotificationSummary(req, res) {
    try {
      const userId = req.user.id;

      const [unreadCount, urgentCount, assignmentCount] = await Promise.all([
        // Count unread notifications
        Notification.countDocuments({
          recipientId: userId,
          isActive: true,
          isDismissed: false,
          isRead: false,
        }),

        // Count urgent notifications
        Notification.countDocuments({
          recipientId: userId,
          isActive: true,
          isDismissed: false,
          priority: "high",
        }),

        // Count assignment notifications
        Notification.countDocuments({
          recipientId: userId,
          isActive: true,
          isDismissed: false,
          type: "assignment",
        }),
      ]);

      res.status(200).json({
        unreadCount,
        urgentCount,
        assignmentCount,
        hasNotifications: unreadCount > 0,
      });
    } catch (error) {
      console.error("Error fetching notification summary:", error);
      res.status(500).json({
        message: "Failed to fetch notification summary",
        error: error.message,
      });
    }
  }

  // Legacy: Get old quiz failure notifications (for backward compatibility)
  static async getAllNotifications(req, res) {
    try {
      const notifications = await Notification.find({
        type: "quiz_failure",
        isActive: true,
      })
        .populate("recipientId", "name") // Teacher
        .sort({ createdAt: -1 });

      // Transform to old format for backward compatibility
      const transformedNotifications = notifications.map((notif) => ({
        studentId: notif.senderId, // Student who failed
        studentName: notif.message.split(" ")[0], // Extract from message
        assignment: notif.quizFailureDetails?.activityTitle || "Quiz",
        scoreInPercent: notif.quizFailureDetails?.scorePercent || 0,
        createdAt: notif.createdAt,
      }));

      res.status(200).json(transformedNotifications);
    } catch (error) {
      console.error("Error fetching legacy notifications:", error);
      res.status(500).json({
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  }

  static async getAllTeacherNotifications(req, res) {
    try {
      // Get teacherId from query params instead of req.user
      const { teacherId } = req.query;
      
      console.log('=== DEBUG START ===');
      console.log('Request query params:', req.query);
      console.log('Teacher ID received:', teacherId);
      
      if (!teacherId) {
        console.log('No teacherId provided');
        return res.status(400).json({ 
          message: "teacherId is required as query parameter",
          example: "/api/notifications/all-teacher-notifications?teacherId=USER_ID"
        });
      }
  
      // Test basic database connection first
      console.log('Testing database models...');
      console.log('PhysicalClassroom model exists:', !!PhysicalClassroom);
      console.log('Notification model exists:', !!Notification);
  
      // Find classrooms where this user is the teacher
      console.log('Searching for classrooms with teacherId:', teacherId);
      const classrooms = await PhysicalClassroom.find({
        teacherId: teacherId,
        isActive: true,
      }).select('_id name').lean();
  
      console.log('Raw classroom query result:', classrooms);
      console.log('Found classrooms count:', classrooms?.length || 0);
  
      if (!classrooms || classrooms.length === 0) {
        console.log('No classrooms found for teacher - checking if any classrooms exist at all...');
        const allClassrooms = await PhysicalClassroom.find({}).limit(5).lean();
        console.log('Sample of all classrooms:', allClassrooms);
        
        return res.status(200).json({
          message: "No classrooms found for this teacher",
          teacherId,
          debug: {
            totalClassroomsInDB: allClassrooms.length,
            sampleClassrooms: allClassrooms
          }
        });
      }
  
      const classroomIds = classrooms.map(c => c._id);
      console.log('Classroom IDs to search:', classroomIds);
  
      // Check if any notifications exist at all
      const totalNotifications = await Notification.countDocuments({});
      console.log('Total notifications in database:', totalNotifications);
  
      // Fetch notifications for these classrooms
      console.log('Searching for notifications...');
      const notifications = await Notification.find({
        physicalClassroomId: { $in: classroomIds },
        isActive: true,
        isDismissed: false,
        type: { $in: ["quiz_failure", "announcement"] }
      })
      .populate("senderId", "name email")
      .populate("recipientId", "name email") 
      .populate("physicalClassroomId", "name")
      .sort({ createdAt: -1 })
      .lean();
  
      console.log('Found notifications count:', notifications?.length || 0);
      console.log('=== DEBUG END ===');
  
      res.status(200).json(notifications);
  
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
      console.error("Teacher ID:", req.query?.teacherId);
      console.error("=== END ERROR ===");
      
      res.status(500).json({ 
        message: "Failed to fetch notifications",
        error: error.message,
        teacherId: req.query?.teacherId,
        errorType: error.name,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error.stack,
          fullError: error.toString()
        })
      });
    }
  }

  // Add these methods to your notificationController.js

  // Method 1: Get teacher notifications (quiz failures)
  static async getTeacherNotifications(req, res) {
    try {
      const PhysicalClassroom = require("../models/physicalClassroomModel");

      // Find classrooms teacher teaches
      const classrooms = await PhysicalClassroom.find({
        teacherId: req.user.id,
        isActive: true,
      });

      const classroomIds = classrooms.map((c) => c._id);

      // Find quiz failure notifications for students in those classrooms
      const notifications = await Notification.find({
        physicalClassroomId: { $in: classroomIds },
        type: "quiz_failure",
        isActive: true,
        isDismissed: false,
      })
        .populate("recipientId", "name")
        .populate("physicalClassroomId", "name")
        .sort({ createdAt: -1 });

      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching teacher notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }

  // Method 2: Create announcement
  static async createAnnouncement(req, res) {
    try {
      const { physicalClassroomId, title, message } = req.body;

      const announcementData = {
        senderId: req.user.id,
        title,
        message,
        priority: "medium",
      };

      // Create notifications for all students in classroom
      await Notification.createAnnouncementNotifications(
        announcementData,
        physicalClassroomId
      );

      res.status(201).json({
        message: "Announcement sent to all students in classroom",
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  }

  static async sendEmailNotification(req, res) {
    try {
      console.log('req.body:', req.body);
      const { recipientEmail, subject, message } = req.body;

      // Validate required fields
      if (!recipientEmail || !subject || !message) {
        return res.status(400).json({
          message:
            "Missing required fields: recipientEmail, subject, and message are required",
        });
      }

      // Check environment variables
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("Missing Gmail credentials in environment variables");
        return res.status(500).json({
          message: "Email service not configured properly",
        });
      }

      console.log(
        `Attempting to send email to ${recipientEmail} with subject: ${subject}`
      );
      console.log(`From: ${process.env.GMAIL_USER}`);
      console.log(`Message: ${message}`);

      // Create a transporter using Gmail
      // Ensure you have set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        debug: true, // Enable debug output
        logger: true, // Enable logging
      });

      // Verify the transporter configuration
      transporter.verify((error, success) => {
        if (error) {
          console.error("Transporter verification failed:", error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });

      // Prepare the email options with from, recipient, subject, and message
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: subject,
        text: message,
        html: `<p>${message.replace(/\n/g, "<br>")}</p>`, // Add HTML version
      };

      // Send the email using the transporter
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          return res
            .status(500)
            .json({
              message: "Failed to send email notification",
              error: error.message,
            });
        }
        // Log the successful email sending
        console.log("Email sent successfully:", info.response);
        // Debugging output for message info
        console.log("Message info:", JSON.stringify(info, null, 2));
        res.status(200).json({
          message: "Email notification sent successfully",
          messageId: info.messageId,
          response: info.response,
        });
      });
    } catch (error) {
      console.error("Catch block error:", error);
      res
        .status(500)
        .json({
          message: "Failed to send email notification",
          error: error.message,
        });
    }
  }

  static async sendClassroomInvite(req, res) {
    try {
      console.log('req.body:', req.body);
      // Extract required fields from request body
      const { userId, recipientEmail, classroomName, classroomId, acceptInviteUrl } = req.body;
      console.log('Extracted fields:', { userId, recipientEmail, classroomName, classroomId, acceptInviteUrl });
      // Validate required fields
      if (!userId || !recipientEmail || !classroomName || !classroomId || !acceptInviteUrl) {
        return res.status(400).json({
          message: 'Missing required fields: userId, recipientEmail, classroomName, classroomId, acceptInviteUrl'
        });
      }

      // Render the HTML template
      const htmlContent = await NotificationController.renderTemplate('invite.html', {
        classroom_name: classroomName,
        accept_invite_url: `${acceptInviteUrl}?userId=${userId}&classroomName=${encodeURIComponent(classroomName)}&classroomId=${classroomId}`,
        userId: userId
      });

      // Create transporter (same as your existing code)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        }
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: `You're invited to join ${classroomName}`,
        html: htmlContent, // Use the rendered HTML template
        text: `You've been invited to join the classroom: ${classroomName}. Visit ${acceptInviteUrl} to accept.` // Fallback text
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      
      res.status(200).json({ 
        message: 'Classroom invitation sent successfully',
        messageId: info.messageId
      });

    } catch (error) {
      console.error('Error sending classroom invite:', error);
      res.status(500).json({ message: 'Failed to send classroom invitation', error: error.message });
    }
  }

  // Helper function to render HTML templates with variables
  static async renderTemplate(templateName, variables) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', templateName);
      let html = await fs.readFile(templatePath, 'utf-8');
      
      // Replace template variables ({{ variable_name }}) with actual values
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        html = html.replace(regex, variables[key]);
      });
      
      return html;
    } catch (error) {
      console.error('Error rendering template:', error);
      throw error;
    }
  }

  // Serve the invitation acceptance page
  static async serveAcceptInvitePage(req, res) {
    try {
      const html = await fs.readFile(
        path.join(__dirname, '..', 'templates', 'accept-invite.html'), 
        'utf-8'
      );
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error serving accept invite page:', error);
      res.status(500).json({ message: 'Failed to load invitation page' });
    }
  }

  // Handle the actual invitation acceptance
  static async acceptClassroomInvite(req, res) {
    try {
      const { userId, classroomName } = req.body;

      if (!userId || !classroomName) {
        return res.status(400).json({
          message: 'Missing required fields: userId and classroomName'
        });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find the classroom by name (you might want to use a more specific identifier)
      const classroom = await PhysicalClassroom.findOne({ 
        name: classroomName, 
        isActive: true 
      });
      
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }

      // Check if user is already in the classroom
      if (classroom.studentIds.includes(userId)) {
        return res.status(200).json({ 
          message: 'You are already a member of this classroom',
          classroom: { name: classroom.name, id: classroom._id }
        });
      }

      // Add user to classroom
      classroom.studentIds.push(userId);
      await classroom.save();

      res.status(200).json({
        message: 'Successfully joined the classroom',
        classroom: { 
          name: classroom.name, 
          id: classroom._id,
          teacherName: classroom.teacherId.name || 'Unknown Teacher'
        }
      });

    } catch (error) {
      console.error('Error accepting classroom invite:', error);
      res.status(500).json({ 
        message: 'Failed to accept invitation', 
        error: error.message 
      });
    }
  }
}

module.exports = NotificationController;
