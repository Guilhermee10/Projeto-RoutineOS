const activityRepository = require('../repositories/activityRepository');
const workScheduleRepository = require('../repositories/workScheduleRepository');
const flexibleGoalRepository = require('../repositories/flexibleGoalRepository');
const scheduledSlotRepository = require('../repositories/scheduledSlotRepository');
const { getWeekRange, getDatesOfWeek, getToday } = require('../utils/dateUtils');
const { planWeek } = require('./optimizationPlanner');

// Camada de I/O do motor: busca os dados, delega a decisão pro
// planner (função pura) e persiste as sugestões geradas.
async function analyzeWeek(userId, referenceDateString) {
  const referenceDate = referenceDateString ? new Date(referenceDateString) : getToday();
  const { monday, sunday } = getWeekRange(referenceDate);

  const [activities, workSchedules, flexibleGoals] = await Promise.all([
    activityRepository.findAllByUser(userId),
    workScheduleRepository.findAllByUser(userId),
    flexibleGoalRepository.findAllByUser(userId),
  ]);

  // Idempotente: apagamos sugestões antigas dessa semana antes de gerar
  // novas, pra poder rodar a análise várias vezes sem duplicar nada.
  // Sugestões já CONFIRMADAS pelo usuário nunca são tocadas aqui.
  await scheduledSlotRepository.deleteSuggestedInRange(userId, monday, sunday);

  const { slots, unmet } = planWeek({
    dates: getDatesOfWeek(monday),
    activities,
    workSchedules,
    flexibleGoals,
  });

  const saved = await Promise.all(
    slots.map((slot) =>
      scheduledSlotRepository.create({ ...slot, userId, status: 'SUGGESTED' })
    )
  );

  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
    suggestionsCreated: saved.length,
    suggestions: saved,
    unmet, // metas que não couberam completamente na semana
  };
}

module.exports = { analyzeWeek };
