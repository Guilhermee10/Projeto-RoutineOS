const goalRepository = require('../repositories/goalRepository');
const studyRepository = require('../repositories/studyRepository');
const workoutRepository = require('../repositories/workoutRepository');
const sleepRepository = require('../repositories/sleepRepository');
const goalCheckInRepository = require('../repositories/goalCheckInRepository');
const AppError = require('../utils/AppError');
const { pickFields } = require('../utils/pickFields');
const { getWeekRange, getMonthRange, endOfDay, getToday } = require('../utils/dateUtils');
const { calculateDurationInMinutes } = require('../utils/timeUtils');
const { filterSinceReset } = require('../utils/goalProgressUtils');

function getPeriodRange(period) {
  if (period === 'MENSAL') {
    const { start, end } = getMonthRange();
    return { from: start, to: endOfDay(end) };
  }
  const { monday, sunday } = getWeekRange();
  return { from: monday, to: endOfDay(sunday) };
}

// Calcula o progresso atual de UMA meta, buscando na fonte de dado
// certa de acordo com o tipo. Cada branch é independente de propósito -
// fica fácil adicionar um novo tipo de meta sem mexer nos outros.
async function calculateProgress(userId, goal) {
  const { from, to } = getPeriodRange(goal.period);

  if (goal.type === 'ESTUDO_HORAS') {
    const sessions = filterSinceReset(
      await studyRepository.findAllByUser(userId, { from, to }),
      goal.progressResetAt
    );
    // Só contam as sessões que você vinculou a ESTA meta ao registrar o
    // estudo. Estudar sozinho nunca preenche meta nenhuma.
    const relevant = sessions.filter((s) => s.goalId === goal.id);
    const current = relevant.reduce((sum, s) => sum + s.durationMinutes, 0);
    return { current, unit: 'minutos' };
  }

  if (goal.type === 'TREINO_QUANTIDADE') {
    // Só contam os treinos vinculados a ESTA meta ao registrar o treino.
    const workouts = filterSinceReset(
      await workoutRepository.findAllByUser(userId, { from, to }),
      goal.progressResetAt
    ).filter((w) => w.goalId === goal.id);
    return { current: workouts.length, unit: 'treinos' };
  }

  if (goal.type === 'SONO_HORAS') {
    const records = filterSinceReset(
      await sleepRepository.findAllByUser(userId, { from, to }),
      goal.progressResetAt
    );
    const current = records.reduce(
      (sum, r) => sum + calculateDurationInMinutes(r.wentToSleepAt, r.wokeUpAt),
      0
    );
    return { current, unit: 'minutos' };
  }

  // PERSONALIZADA: não tem fonte automática, o valor é só o que o
  // usuário registrou manualmente via /progress
  return { current: goal.manualProgress, unit: 'unidades' };
}

async function toResponseWithProgress(userId, goal) {
  const { current, unit } = await calculateProgress(userId, goal);
  const percentage = goal.targetValue > 0
    ? Math.min(Math.round((current / goal.targetValue) * 100), 100)
    : 0;

  // checkedInToday é um sinal de HÁBITO separado do progress (que mede
  // horas/quantidade de verdade) - "eu toquei nessa meta hoje?".
  const todayCheckIn = await goalCheckInRepository.findOne(goal.id, userId, getToday());

  return {
    ...goal,
    progress: { current, target: goal.targetValue, unit, percentage },
    checkedInToday: Boolean(todayCheckIn),
  };
}

async function listByUser(userId) {
  const goals = await goalRepository.findAllByUser(userId);
  return Promise.all(goals.map((goal) => toResponseWithProgress(userId, goal)));
}

// `manualProgress` fica DE FORA de propósito: ele só muda pelo endpoint
// dedicado /progress (com semântica de incremento). `progress` e
// `checkedInToday` também não entram - são campos calculados que vêm
// na resposta da API, não colunas do banco.
const UPDATABLE_FIELDS = ['name', 'type', 'subject', 'targetValue', 'period'];

function pickGoalInput(data) {
  return pickFields(data, UPDATABLE_FIELDS);
}

async function create(userId, data) {
  const goal = await goalRepository.create({ ...pickGoalInput(data), userId });
  return toResponseWithProgress(userId, goal);
}

async function update(userId, id, data) {
  const existing = await goalRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Meta não encontrada.', 404);
  const goal = await goalRepository.update(id, pickGoalInput(data));
  return toResponseWithProgress(userId, goal);
}

async function remove(userId, id) {
  const existing = await goalRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Meta não encontrada.', 404);
  await goalRepository.remove(id);
}

async function registerManualProgress(userId, id, increment) {
  const existing = await goalRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Meta não encontrada.', 404);
  if (existing.type !== 'PERSONALIZADA') {
    throw new AppError(
      'Essa meta calcula o progresso automaticamente - não é possível registrar manualmente.',
      400
    );
  }
  const goal = await goalRepository.update(id, {
    manualProgress: existing.manualProgress + increment,
  });
  return toResponseWithProgress(userId, goal);
}

// Zera o progresso: a meta volta a 0 e só passa a contar o que for
// registrado a partir de agora. Nenhum registro de estudo/treino/sono é
// apagado - só deixa de entrar na conta dessa meta.
async function resetProgress(userId, id) {
  const existing = await goalRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Meta não encontrada.', 404);
  const goal = await goalRepository.update(id, { progressResetAt: new Date(), manualProgress: 0 });
  return toResponseWithProgress(userId, goal);
}

module.exports = { listByUser, create, update, remove, registerManualProgress, resetProgress };
