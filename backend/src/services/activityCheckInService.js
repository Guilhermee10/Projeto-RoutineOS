const activityRepository = require('../repositories/activityRepository');
const activityCheckInRepository = require('../repositories/activityCheckInRepository');
const AppError = require('../utils/AppError');
const { startOfDay } = require('../utils/dateUtils');

async function setCheckIn(userId, activityId, dateString, completed) {
  const activity = await activityRepository.findByIdAndUser(activityId, userId);
  if (!activity) {
    throw new AppError('Atividade não encontrada.', 404);
  }

  const date = startOfDay(new Date(dateString));

  if (completed) {
    // Idempotente: se já existe check-in pra esse dia, não duplica
    // (também evitado pelo @@unique do schema, mas checar antes evita
    // depender de capturar o erro de constraint).
    const existing = await activityCheckInRepository.findOne(activityId, userId, date);
    if (!existing) {
      await activityCheckInRepository.create({ activityId, userId, date });
    }
  } else {
    await activityCheckInRepository.removeByActivityAndDate(activityId, userId, date);
  }

  return { activityId, date: date.toISOString().slice(0, 10), completed };
}

function listInRange(userId, from, to) {
  return activityCheckInRepository.findAllByUserInRange(userId, from, to);
}

module.exports = { setCheckIn, listInRange };
