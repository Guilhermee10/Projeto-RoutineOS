const studyRepository = require('../repositories/studyRepository');
const AppError = require('../utils/AppError');
const { resolveLinkedGoalId } = require('./goalLinkService');
const { pickFields } = require('../utils/pickFields');

const UPDATABLE_FIELDS = ['date', 'subject', 'durationMinutes', 'content', 'goal', 'notes', 'goalId'];

function pickStudyInput(data) {
  const picked = pickFields(data, UPDATABLE_FIELDS);
  if (picked.date) picked.date = new Date(picked.date);
  return picked;
}

async function listByUser(userId, filters) {
  return studyRepository.findAllByUser(userId, filters);
}

async function create(userId, data) {
  const input = pickStudyInput(data);
  if ('goalId' in input) input.goalId = await resolveLinkedGoalId(userId, input.goalId, 'ESTUDO_HORAS', 'horas de estudo');
  return studyRepository.create({ ...input, userId });
}

async function update(userId, id, data) {
  const existing = await studyRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Sessão de estudo não encontrada.', 404);

  const input = pickStudyInput(data);
  if ('goalId' in input) input.goalId = await resolveLinkedGoalId(userId, input.goalId, 'ESTUDO_HORAS', 'horas de estudo');
  return studyRepository.update(id, input);
}

async function remove(userId, id) {
  const existing = await studyRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Sessão de estudo não encontrada.', 404);
  await studyRepository.remove(id);
}

// Agrupa o tempo estudado por matéria - é a base do gráfico de
// "distribuição do tempo entre matérias" mencionado no dashboard.
async function getStats(userId, filters) {
  const sessions = await listByUser(userId, filters);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const bySubject = sessions.reduce((acc, session) => {
    acc[session.subject] = (acc[session.subject] || 0) + session.durationMinutes;
    return acc;
  }, {});

  return {
    sessionsCount: sessions.length,
    totalMinutes,
    bySubject,
  };
}

module.exports = { listByUser, create, update, remove, getStats };
