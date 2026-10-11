const goalRepository = require('../repositories/goalRepository');
const goalCheckInRepository = require('../repositories/goalCheckInRepository');
const AppError = require('../utils/AppError');
const { startOfDay } = require('../utils/dateUtils');

async function setCheckIn(userId, goalId, dateString, completed) {
  const goal = await goalRepository.findByIdAndUser(goalId, userId);
  if (!goal) {
    throw new AppError('Meta não encontrada.', 404);
  }

  const date = startOfDay(new Date(dateString));

  if (completed) {
    const existing = await goalCheckInRepository.findOne(goalId, userId, date);
    if (!existing) {
      await goalCheckInRepository.create({ goalId, userId, date });
    }
  } else {
    await goalCheckInRepository.removeByGoalAndDate(goalId, userId, date);
  }

  return { goalId, date: date.toISOString().slice(0, 10), completed };
}

module.exports = { setCheckIn };
