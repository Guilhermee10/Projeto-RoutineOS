const { timeToMinutes } = require('./timeUtils');

// Fallback: hora LOCAL do servidor. Em uso normal a hora vem do navegador
// (header X-Client-Time, ver clientClock em middlewares/clientClock.js);
// isto só vale pra chamadas sem esse header.
function getCurrentTimeString(now = new Date()) {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function formatMinutesLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

// Atividades de hoje que começam dentro da janela (padrão: 60min) a
// partir de agora, e ainda não começaram.
function getUpcomingActivityNotifications(todaysActivities, nowTime, windowMinutes = 60) {
  const nowMinutes = timeToMinutes(nowTime);

  return todaysActivities.reduce((notifications, activity) => {
    const diff = timeToMinutes(activity.startTime) - nowMinutes;
    if (diff > 0 && diff <= windowMinutes) {
      notifications.push({
        id: `upcoming-${activity.id}`,
        type: 'UPCOMING_ACTIVITY',
        icon: '🔔',
        message: `Hora de ${activity.name} - começa em ${diff}min`,
      });
    }
    return notifications;
  }, []);
}

// Metas (já com progress calculado) que estão perto da meta, mas
// ainda não bateram 100%.
function getGoalProgressNotifications(goalsWithProgress, nearThreshold = 80) {
  return goalsWithProgress.reduce((notifications, goal) => {
    const { percentage, current, target, unit } = goal.progress;
    if (percentage >= nearThreshold && percentage < 100) {
      const remaining = target - current;
      const remainingLabel = unit === 'minutos' ? formatMinutesLabel(remaining) : `${remaining} ${unit}`;
      notifications.push({
        id: `goal-${goal.id}`,
        type: 'GOAL_NEAR_TARGET',
        icon: '🔔',
        message: `Meta "${goal.name}" - você está a ${remainingLabel} de bater!`,
      });
    }
    return notifications;
  }, []);
}

module.exports = {
  getCurrentTimeString,
  formatMinutesLabel,
  getUpcomingActivityNotifications,
  getGoalProgressNotifications,
};
