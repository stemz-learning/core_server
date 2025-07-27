const Notification = require('../models/notificationModel');
const connectDB = require('../mongodb');
const nodemailer = require('nodemailer');

class NotificationController {
  static async getAllNotifications(req, res) {
    try {
      await connectDB();
      const notifications = await Notification.find().sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notifications', error });
    }
  }

  // Sends an email to a specified recipient
  // Requires recipientEmail, subject, and message in the request body
  static async sendEmailNotification(req, res) {
    try {
      const { recipientEmail, subject, message } = req.body;

      // Validate required fields
      if (!recipientEmail || !subject || !message) {
        return res.status(400).json({ 
          message: 'Missing required fields: recipientEmail, subject, and message are required' 
        });
      }

      // Check environment variables
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('Missing Gmail credentials in environment variables');
        return res.status(500).json({ 
          message: 'Email service not configured properly' 
        });
      }

      console.log(`Attempting to send email to ${recipientEmail} with subject: ${subject}`);
      console.log(`From: ${process.env.GMAIL_USER}`);
      console.log(`Message: ${message}`);

      // Create a transporter using Gmail
      // Ensure you have set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        debug: true, // Enable debug output
        logger: true // Enable logging
      });

      // Verify the transporter configuration
      transporter.verify((error, success) => {
        if (error) {
          console.error('Transporter verification failed:', error);
        } else {
          console.log('Server is ready to take our messages');
        }
      });

      // Prepare the email options with from, recipient, subject, and message
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: subject,
        text: message,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>` // Add HTML version
      };

      // Send the email using the transporter
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          return res.status(500).json({ message: 'Failed to send email notification', error: error.message });
        }
        // Log the successful email sending
        console.log('Email sent successfully:', info.response);
        // Debugging output for message info
        console.log('Message info:', JSON.stringify(info, null, 2));
        res.status(200).json({ 
          message: 'Email notification sent successfully',
          messageId: info.messageId,
          response: info.response
        });
      });
    } catch (error) {
      console.error('Catch block error:', error);
      res.status(500).json({ message: 'Failed to send email notification', error: error.message });
    }
  }
}

module.exports = { NotificationController };
