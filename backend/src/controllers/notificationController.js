const prisma = require('../config/db');
const {
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  generateNotificationsForUser
} = require('../services/notificationService');

// GET ALL NOTIFICATIONS & UNREAD COUNT
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trigger notification generation engine
    await generateNotificationsForUser(userId);

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.notification.count({
        where: { userId, read: false }
      })
    ]);

    res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET UNREAD COUNT (FOR NAVBAR BADGE)
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    await generateNotificationsForUser(userId);

    const count = await prisma.notification.count({
      where: { userId, read: false }
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ error: error.message });
  }
};

// MARK AS READ
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: { read: true }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// MARK ALL AS READ
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE NOTIFICATION
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.notification.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET PREFERENCES
const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const pref = await getUserNotificationPreferences(userId);
    res.status(200).json(pref);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PREFERENCES
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updated = await updateUserNotificationPreferences(userId, req.body);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences
};
