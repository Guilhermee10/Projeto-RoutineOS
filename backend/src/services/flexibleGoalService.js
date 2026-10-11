const flexibleGoalRepository = require('../repositories/flexibleGoalRepository');
const AppError = require('../utils/AppError');
const { pickFields } = require('../utils/pickFields');

const UPDATABLE_FIELDS = [
  'name', 'durationMinutes', 'frequencyPerWeek', 'activityType',
  'fitMode', 'priority', 'suitableForCommute',
];

function pickFlexibleGoalInput(data) {
  return pickFields(data, UPDATABLE_FIELDS);
}

function listByUser(userId) {
  return flexibleGoalRepository.findAllByUser(userId);
}

function create(userId, data) {
  return flexibleGoalRepository.create({ ...pickFlexibleGoalInput(data), userId });
}

async function update(userId, goalId, data) {
  const existing = await flexibleGoalRepository.findByIdAndUser(goalId, userId);
  if (!existing) {
    throw new AppError('Meta flexível não encontrada.', 404);
  }
  return flexibleGoalRepository.update(goalId, pickFlexibleGoalInput(data));
}

async function remove(userId, goalId) {
  const existing = await flexibleGoalRepository.findByIdAndUser(goalId, userId);
  if (!existing) {
    throw new AppError('Meta flexível não encontrada.', 404);
  }
  await flexibleGoalRepository.remove(goalId);
}

module.exports = { listByUser, create, update, remove };
