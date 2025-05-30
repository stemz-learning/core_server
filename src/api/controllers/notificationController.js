const Notification = require('../models/notificationModel');
const connectDB = require('../mongodb');

const getAllNotifications = async (req, res) => {
  try {
    await connectDB();
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error });
  }
};

module.exports = { getAllNotifications };
