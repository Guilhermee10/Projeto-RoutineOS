const activityRepository = require('../repositories/activityRepository');
const goalService = require('../services/goalService');
const { getToday } = require('../utils/dateUtils');
const { getClientTime } = require('../utils/requestContext');
const {
  getCurrentTimeString,
  getUpcomingActivityNotifications,
  getGoalProgressNotifications,
} = require('../utils/notificationUtils');

async function getNotifications(userId) {
  const [activities, goals] = await Promise.all([
    activityRepository.findAllByUser(userId),
    goalService.listByUser(userId), // já vem com `progress` calculado
  ]);

  const dayOfWeek = getToday().getUTCDay();
  const todaysActivities = activities.filter((a) => a.daysOfWeek.includes(dayOfWeek));

  const upcoming = getUpcomingActivityNotifications(todaysActivities, getClientTime() || getCurrentTimeString());
  const goalsNear = getGoalProgressNotifications(goals);

  return [...upcoming, ...goalsNear];
}

module.exports = { getNotifications };
