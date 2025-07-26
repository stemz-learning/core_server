const Notification = require('../models/notificationModel');
const connectDB = require('../mongodb');

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

  static async sendEmailNotification(req, res) {
    try {
      await connectDB();
      const { recipientEmail, subject, message } = req.body;

      // Here you would integrate with an email service to send the email
      // For example, using nodemailer or any other email service provider

      // Simulating email sending
      console.log(`Sending email to ${recipientEmail} with subject: ${subject}`);
      console.log(`Message: ${message}`);

      res.status(200).json({ message: 'Email notification sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send email notification', error });
    }
  }
}

module.exports = { NotificationController };
