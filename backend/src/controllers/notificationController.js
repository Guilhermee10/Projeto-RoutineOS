const notificationService = require('../services/notificationService');

async function list(req, res, next) {
  try {
    const notifications = await notificationService.getNotifications(req.userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

module.exports = { list };
