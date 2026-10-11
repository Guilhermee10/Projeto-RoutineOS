const workoutRepository = require('../repositories/workoutRepository');
const AppError = require('../utils/AppError');
const { pickFields } = require('../utils/pickFields');
const { resolveLinkedGoalId } = require('./goalLinkService');

const UPDATABLE_FIELDS = ['date', 'type', 'durationMinutes', 'objective', 'notes', 'goalId'];

function pickWorkoutInput(data) {
  const picked = pickFields(data, UPDATABLE_FIELDS);
  if (picked.date) picked.date = new Date(picked.date);
  return picked;
}

async function listByUser(userId, filters) {
  return workoutRepository.findAllByUser(userId, filters);
}

async function create(userId, data) {
  const input = pickWorkoutInput(data);
  if ('goalId' in input) input.goalId = await resolveLinkedGoalId(userId, input.goalId, 'TREINO_QUANTIDADE', 'quantidade de treinos');
  return workoutRepository.create({ ...input, userId });
}

async function update(userId, id, data) {
  const existing = await workoutRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Treino não encontrado.', 404);

  const input = pickWorkoutInput(data);
  if ('goalId' in input) input.goalId = await resolveLinkedGoalId(userId, input.goalId, 'TREINO_QUANTIDADE', 'quantidade de treinos');
  return workoutRepository.update(id, input);
}

async function remove(userId, id) {
  const existing = await workoutRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Treino não encontrado.', 404);
  await workoutRepository.remove(id);
}

// Frequência = quantos treinos por semana, em média, no período pedido.
async function getStats(userId, filters) {
  const workouts = await listByUser(userId, filters);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  const byType = workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});

  let weeksInPeriod = 1;
  if (filters?.from && filters?.to) {
    const days = (filters.to - filters.from) / (1000 * 60 * 60 * 24);
    weeksInPeriod = Math.max(days / 7, 1);
  }

  return {
    totalWorkouts: workouts.length,
    totalMinutes,
    byType,
    averagePerWeek: Number((workouts.length / weeksInPeriod).toFixed(1)),
  };
}

module.exports = { listByUser, create, update, remove, getStats };
