const sleepRepository = require('../repositories/sleepRepository');
const AppError = require('../utils/AppError');
const { pickFields } = require('../utils/pickFields');
const { calculateDurationInMinutes } = require('../utils/timeUtils');
const { calculateAverage, calculateMin, calculateMax } = require('../utils/statsUtils');

const DEFAULT_GOAL_MINUTES = 8 * 60;

// Whitelist dos campos graváveis - protege contra o cliente mandar
// campos a mais no body (ex: reenviando de volta um registro que
// recebeu da API, já com `id`, `durationMinutes` calculado etc).
const UPDATABLE_FIELDS = ['date', 'wentToSleepAt', 'wokeUpAt', 'interruptions', 'quality', 'notes'];

function pickSleepInput(data) {
  const picked = pickFields(data, UPDATABLE_FIELDS);
  if (picked.date) picked.date = new Date(picked.date);
  return picked;
}

function toResponse(record) {
  return {
    ...record,
    durationMinutes: calculateDurationInMinutes(record.wentToSleepAt, record.wokeUpAt),
  };
}

async function listByUser(userId, filters) {
  const records = await sleepRepository.findAllByUser(userId, filters);
  return records.map(toResponse);
}

async function create(userId, data) {
  const created = await sleepRepository.create({ ...pickSleepInput(data), userId });
  return toResponse(created);
}

async function update(userId, id, data) {
  const existing = await sleepRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Registro de sono não encontrado.', 404);

  const updated = await sleepRepository.update(id, pickSleepInput(data));
  return toResponse(updated);
}

async function remove(userId, id) {
  const existing = await sleepRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Registro de sono não encontrado.', 404);
  await sleepRepository.remove(id);
}

// goalMinutes é opcional (o usuário ainda não tem "meta de sono"
// configurada em lugar nenhum - isso pode virar um Goal no Sprint 8).
async function getStats(userId, { from, to, goalMinutes = DEFAULT_GOAL_MINUTES } = {}) {
  const records = await listByUser(userId, { from, to });
  const durations = records.map((r) => r.durationMinutes);

  const averageMinutes = calculateAverage(durations);

  return {
    recordsCount: records.length,
    averageMinutes: Math.round(averageMinutes),
    minMinutes: calculateMin(durations),
    maxMinutes: calculateMax(durations),
    goalMinutes,
    diffFromGoalMinutes: Math.round(averageMinutes - goalMinutes),
  };
}

module.exports = { listByUser, create, update, remove, getStats };
