const AppError = require('./AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterInput({ name, email, password }) {
  if (!name || name.trim().length < 2) {
    throw new AppError('Nome deve ter pelo menos 2 caracteres.', 422);
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new AppError('E-mail inválido.', 422);
  }
  if (!password || password.length < 8) {
    throw new AppError('Senha deve ter pelo menos 8 caracteres.', 422);
  }
  if (password.length > 72) {
    // o bcrypt ignora tudo depois de 72 bytes - melhor avisar do que truncar em silêncio
    throw new AppError('Senha deve ter no máximo 72 caracteres.', 422);
  }
}

function validateLoginInput({ email, password }) {
  if (!email || !password) {
    throw new AppError('E-mail e senha são obrigatórios.', 422);
  }
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const CATEGORIES = [
  'TRABALHO', 'ESTUDO', 'FACULDADE', 'TREINO', 'TRANSPORTE',
  'SONO', 'ALIMENTACAO', 'LAZER', 'COMPROMISSO', 'OUTROS',
];
const PRIORITIES = ['BAIXA', 'MEDIA', 'ALTA'];

function validateCommuteMinutes(commuteMinutes) {
  if (
    commuteMinutes !== undefined &&
    commuteMinutes !== null &&
    (!Number.isInteger(commuteMinutes) || commuteMinutes < 0)
  ) {
    throw new AppError('commuteMinutes deve ser um número inteiro não negativo.', 422);
  }
}

function validateActivityInput({ name, category, startTime, endTime, daysOfWeek, priority, commuteMinutes }) {
  if (!name || name.trim().length < 2) {
    throw new AppError('Nome da atividade deve ter pelo menos 2 caracteres.', 422);
  }
  if (!CATEGORIES.includes(category)) {
    throw new AppError(`Categoria inválida. Use uma de: ${CATEGORIES.join(', ')}.`, 422);
  }
  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    throw new AppError('Horário deve estar no formato HH:mm.', 422);
  }
  if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
    throw new AppError('Informe ao menos um dia da semana (0=domingo a 6=sábado).', 422);
  }
  if (daysOfWeek.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new AppError('Dias da semana devem ser números de 0 a 6.', 422);
  }
  if (priority && !PRIORITIES.includes(priority)) {
    throw new AppError(`Prioridade inválida. Use uma de: ${PRIORITIES.join(', ')}.`, 422);
  }
  validateCommuteMinutes(commuteMinutes);
}

function validateFlexibleGoalInput({ name, durationMinutes, frequencyPerWeek, activityType, fitMode }) {
  if (!name || name.trim().length < 2) {
    throw new AppError('Nome da meta deve ter pelo menos 2 caracteres.', 422);
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new AppError('Duração deve ser um número inteiro de minutos maior que zero.', 422);
  }
  if (!Number.isInteger(frequencyPerWeek) || frequencyPerWeek <= 0 || frequencyPerWeek > 7) {
    throw new AppError('Frequência semanal deve ser um número entre 1 e 7.', 422);
  }
  if (!CATEGORIES.includes(activityType)) {
    throw new AppError(`Tipo de atividade inválido. Use uma de: ${CATEGORIES.join(', ')}.`, 422);
  }
  if (fitMode && !['MANUAL', 'AUTO'].includes(fitMode)) {
    throw new AppError('fitMode deve ser MANUAL ou AUTO.', 422);
  }
}

// Para updates parciais (PUT/PATCH), só validamos os campos que
// realmente vieram no body - não faz sentido exigir todos os campos
// de novo só porque o usuário quis mudar a prioridade, por exemplo.
function validateActivityUpdateInput(body) {
  if (body.name !== undefined && body.name.trim().length < 2) {
    throw new AppError('Nome da atividade deve ter pelo menos 2 caracteres.', 422);
  }
  if (body.category !== undefined && !CATEGORIES.includes(body.category)) {
    throw new AppError(`Categoria inválida. Use uma de: ${CATEGORIES.join(', ')}.`, 422);
  }
  if (body.startTime !== undefined && !TIME_REGEX.test(body.startTime)) {
    throw new AppError('startTime deve estar no formato HH:mm.', 422);
  }
  if (body.endTime !== undefined && !TIME_REGEX.test(body.endTime)) {
    throw new AppError('endTime deve estar no formato HH:mm.', 422);
  }
  if (body.daysOfWeek !== undefined) {
    if (!Array.isArray(body.daysOfWeek) || body.daysOfWeek.length === 0) {
      throw new AppError('Informe ao menos um dia da semana (0=domingo a 6=sábado).', 422);
    }
    if (body.daysOfWeek.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
      throw new AppError('Dias da semana devem ser números de 0 a 6.', 422);
    }
  }
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
    throw new AppError(`Prioridade inválida. Use uma de: ${PRIORITIES.join(', ')}.`, 422);
  }
  validateCommuteMinutes(body.commuteMinutes);
}

const SLEEP_QUALITIES = ['RUIM', 'REGULAR', 'BOA', 'OTIMA'];

function validateSleepInput({ date, wentToSleepAt, wokeUpAt, interruptions, quality }) {
  if (!date || isNaN(new Date(date).getTime())) {
    throw new AppError('Data inválida.', 422);
  }
  if (!TIME_REGEX.test(wentToSleepAt) || !TIME_REGEX.test(wokeUpAt)) {
    throw new AppError('Horários devem estar no formato HH:mm.', 422);
  }
  if (interruptions !== undefined && (!Number.isInteger(interruptions) || interruptions < 0)) {
    throw new AppError('Interrupções deve ser um número inteiro não negativo.', 422);
  }
  if (quality !== undefined && quality !== null && !SLEEP_QUALITIES.includes(quality)) {
    throw new AppError(`Qualidade inválida. Use uma de: ${SLEEP_QUALITIES.join(', ')}.`, 422);
  }
}

function validateStudySessionInput({ date, subject, durationMinutes }) {
  if (!date || isNaN(new Date(date).getTime())) {
    throw new AppError('Data inválida.', 422);
  }
  if (!subject || subject.trim().length < 2) {
    throw new AppError('Matéria deve ter pelo menos 2 caracteres.', 422);
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new AppError('Duração deve ser um número inteiro de minutos maior que zero.', 422);
  }
}

function validateWorkoutInput({ date, type, durationMinutes }) {
  if (!date || isNaN(new Date(date).getTime())) {
    throw new AppError('Data inválida.', 422);
  }
  if (!type || type.trim().length < 2) {
    throw new AppError('Tipo de treino deve ter pelo menos 2 caracteres.', 422);
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new AppError('Duração deve ser um número inteiro de minutos maior que zero.', 422);
  }
}

function validateWorkScheduleInput(body) {
  const { scaleType, startTime, endTime, breakMinutes, daysOfWeek, cycleStartDate, workDaysInCycle, restDaysInCycle } = body;

  if (!['REGULAR', 'CYCLE'].includes(scaleType)) {
    throw new AppError('scaleType deve ser REGULAR ou CYCLE.', 422);
  }
  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    throw new AppError('Horários devem estar no formato HH:mm.', 422);
  }
  if (breakMinutes !== undefined && (!Number.isInteger(breakMinutes) || breakMinutes < 0)) {
    throw new AppError('breakMinutes deve ser um número inteiro não negativo.', 422);
  }

  if (scaleType === 'REGULAR') {
    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      throw new AppError('Informe ao menos um dia da semana para escala REGULAR.', 422);
    }
  }

  if (scaleType === 'CYCLE') {
    if (!cycleStartDate || isNaN(new Date(cycleStartDate).getTime())) {
      throw new AppError('cycleStartDate é obrigatório e deve ser uma data válida para escala CYCLE.', 422);
    }
    if (!Number.isInteger(workDaysInCycle) || workDaysInCycle <= 0) {
      throw new AppError('workDaysInCycle deve ser um número inteiro maior que zero.', 422);
    }
    if (!Number.isInteger(restDaysInCycle) || restDaysInCycle < 0) {
      throw new AppError('restDaysInCycle deve ser um número inteiro não negativo.', 422);
    }
    const { daysOff } = body;
    if (
      daysOff !== undefined &&
      (!Array.isArray(daysOff) || !daysOff.every((d) => Number.isInteger(d) && d >= 0 && d <= 6))
    ) {
      throw new AppError('daysOff deve ser uma lista de dias da semana (0 a 6).', 422);
    }
  }
}

const NOTE_TITLE_MAX = 120;
const NOTE_CONTENT_MAX = 20000;

// partial = true (edição/fixar/arquivar): só valida o que veio no body.
// partial = false (criação): exige título OU conteúdo preenchido.
function validateNoteInput(body, { partial }) {
  const { title, content, tags, pinned, archived } = body;

  if (title !== undefined && (typeof title !== 'string' || title.length > NOTE_TITLE_MAX)) {
    throw new AppError(`Título deve ser texto de até ${NOTE_TITLE_MAX} caracteres.`, 422);
  }
  if (content !== undefined && (typeof content !== 'string' || content.length > NOTE_CONTENT_MAX)) {
    throw new AppError(`Conteúdo deve ser texto de até ${NOTE_CONTENT_MAX} caracteres.`, 422);
  }
  if (tags !== undefined && !Array.isArray(tags)) {
    throw new AppError('tags deve ser uma lista de textos.', 422);
  }
  if (pinned !== undefined && typeof pinned !== 'boolean') {
    throw new AppError('pinned deve ser true ou false.', 422);
  }
  if (archived !== undefined && typeof archived !== 'boolean') {
    throw new AppError('archived deve ser true ou false.', 422);
  }
  if (!partial && !(title && title.trim()) && !(content && content.trim())) {
    throw new AppError('Escreva um título ou um conteúdo.', 422);
  }
}

const GOAL_TYPES = ['ESTUDO_HORAS', 'TREINO_QUANTIDADE', 'SONO_HORAS', 'PERSONALIZADA'];
const GOAL_PERIODS = ['SEMANAL', 'MENSAL'];

function validateGoalInput({ name, type, targetValue, period }) {
  if (!name || name.trim().length < 2) {
    throw new AppError('Nome da meta deve ter pelo menos 2 caracteres.', 422);
  }
  if (!GOAL_TYPES.includes(type)) {
    throw new AppError(`Tipo inválido. Use um de: ${GOAL_TYPES.join(', ')}.`, 422);
  }
  if (!Number.isInteger(targetValue) || targetValue <= 0) {
    throw new AppError('targetValue deve ser um número inteiro maior que zero.', 422);
  }
  if (period !== undefined && !GOAL_PERIODS.includes(period)) {
    throw new AppError(`period inválido. Use um de: ${GOAL_PERIODS.join(', ')}.`, 422);
  }
}

function validateProgressIncrement({ increment }) {
  if (!Number.isInteger(increment) || increment === 0) {
    throw new AppError('increment deve ser um número inteiro diferente de zero.', 422);
  }
}

function validateCheckInInput({ date, completed }) {
  if (!date || isNaN(new Date(date).getTime())) {
    throw new AppError('Data inválida.', 422);
  }
  if (typeof completed !== 'boolean') {
    throw new AppError('completed deve ser true ou false.', 422);
  }
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateActivityInput,
  validateActivityUpdateInput,
  validateFlexibleGoalInput,
  validateSleepInput,
  validateStudySessionInput,
  validateWorkoutInput,
  validateWorkScheduleInput,
  validateNoteInput,
  validateGoalInput,
  validateProgressIncrement,
  validateCheckInInput,
};
