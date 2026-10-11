const activityRepository = require('../repositories/activityRepository');
const AppError = require('../utils/AppError');
const { pickFields } = require('../utils/pickFields');
const {
  calculateDurationInMinutes,
  activitiesConflict,
} = require('../utils/timeUtils');

function toResponse(activity) {
  return {
    ...activity,
    durationMinutes: calculateDurationInMinutes(activity.startTime, activity.endTime),
  };
}

// Whitelist dos campos que realmente podem ser gravados no banco.
// Protege contra o cliente mandar campos "a mais" no body - seja de
// propósito, seja sem querer (ex: o frontend reenviando de volta um
// objeto que ele recebeu da API, que já vem com `id`, `createdAt`,
// `durationMinutes` calculado etc). Sem isso, o Prisma rejeita a
// escrita inteira assim que vê um campo que não existe no schema.
const UPDATABLE_FIELDS = [
  'name', 'category', 'description', 'startTime', 'endTime',
  'daysOfWeek', 'priority', 'location', 'notes', 'commuteMinutes',
];

function pickActivityInput(data) {
  return pickFields(data, UPDATABLE_FIELDS);
}

async function listByUser(userId) {
  const activities = await activityRepository.findAllByUser(userId);
  return activities.map(toResponse);
}

async function create(userId, data) {
  const input = pickActivityInput(data);

  const existingActivities = await activityRepository.findAllByUser(userId);
  const conflict = existingActivities.find((activity) =>
    activitiesConflict(activity, input)
  );

  if (conflict) {
    throw new AppError(
      `Conflito de horário com a atividade "${conflict.name}".`,
      409
    );
  }

  const created = await activityRepository.create({ ...input, userId });
  return toResponse(created);
}

async function update(userId, activityId, data) {
  const existing = await activityRepository.findByIdAndUser(activityId, userId);
  if (!existing) {
    throw new AppError('Atividade não encontrada.', 404);
  }

  const input = pickActivityInput(data);

  // Checa conflito contra as OUTRAS atividades (exclui ela mesma da checagem)
  const otherActivities = (await activityRepository.findAllByUser(userId)).filter(
    (activity) => activity.id !== activityId
  );
  const merged = { ...existing, ...input };
  const conflict = otherActivities.find((activity) =>
    activitiesConflict(activity, merged)
  );

  if (conflict) {
    throw new AppError(
      `Conflito de horário com a atividade "${conflict.name}".`,
      409
    );
  }

  const updated = await activityRepository.update(activityId, input);
  return toResponse(updated);
}

async function remove(userId, activityId) {
  const existing = await activityRepository.findByIdAndUser(activityId, userId);
  if (!existing) {
    throw new AppError('Atividade não encontrada.', 404);
  }
  await activityRepository.remove(activityId);
}

module.exports = { listByUser, create, update, remove };
