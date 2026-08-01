const { User, Notification } = require('../models');

/**
 * Send push notification to a specific user by ID
 */
const sendNotificationToUser = async ({ userId, type, title, body, data = {} }) => {
  try {
    // Save in-app notification record first
    const notification = await Notification.create({
      userId,
      type: type || 'system',
      title,
      body,
      data,
      sentAt: new Date(),
    });

    // Fetch user FCM tokens
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log(`[Notification] Saved notification for user ${userId}, but no FCM tokens registered.`);
      return notification;
    }

    const fcmServerKey = process.env.FCM_SERVER_KEY;
    if (!fcmServerKey) {
      console.log(`[Notification] Saved notification for user ${userId}. FCM_SERVER_KEY not set in env, skipping remote push.`);
      return notification;
    }

    // Send push notification via standard FCM endpoint
    for (const token of user.fcmTokens) {
      try {
        const payload = {
          to: token,
          notification: { title, body },
          data: { ...data, type },
        };

        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${fcmServerKey}`,
          },
          body: JSON.stringify(payload),
        });

        const resData = await response.json();
        console.log(`[Notification] FCM Push sent to token ${token.substring(0, 10)}... Status:`, resData);
      } catch (err) {
        console.error(`[Notification] Error sending push to token ${token}:`, err.message);
      }
    }

    return notification;
  } catch (error) {
    console.error('[Notification] Failed to process push notification:', error.message);
  }
};

module.exports = {
  sendNotificationToUser,
};
