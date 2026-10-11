const workScheduleRepository = require('../repositories/workScheduleRepository');
const AppError = require('../utils/AppError');
const { pickFields } = require('../utils/pickFields');
const { calculateWorkedMinutesInRange } = require('../utils/workScheduleUtils');

const UPDATABLE_FIELDS = [
  'scaleType', 'startTime', 'endTime', 'breakMinutes', 'daysOfWeek',
  'cycleStartDate', 'workDaysInCycle', 'restDaysInCycle', 'daysOff', 'notes',
];

function pickWorkScheduleInput(data) {
  const picked = pickFields(data, UPDATABLE_FIELDS);
  if (picked.cycleStartDate) picked.cycleStartDate = new Date(picked.cycleStartDate);
  return picked;
}

function listByUser(userId) {
  return workScheduleRepository.findAllByUser(userId);
}

function create(userId, data) {
  return workScheduleRepository.create({ ...pickWorkScheduleInput(data), userId });
}

async function update(userId, id, data) {
  const existing = await workScheduleRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Escala de trabalho não encontrada.', 404);

  return workScheduleRepository.update(id, pickWorkScheduleInput(data));
}

async function remove(userId, id) {
  const existing = await workScheduleRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Escala de trabalho não encontrada.', 404);
  await workScheduleRepository.remove(id);
}

// Soma as horas trabalhadas de TODAS as escalas do usuário num período
// (a maioria das pessoas tem uma escala só, mas suportamos mais de um
// vínculo de trabalho sem esforço extra).
async function getHoursSummary(userId, { from, to }) {
  const schedules = await listByUser(userId);

  let totalMinutes = 0;
  let totalWorkingDays = 0;
  const bySchedule = [];

  for (const schedule of schedules) {
    const { totalMinutes: minutes, workingDays } = calculateWorkedMinutesInRange(
      schedule,
      from,
      to
    );
    totalMinutes += minutes;
    totalWorkingDays += workingDays;
    bySchedule.push({ scheduleId: schedule.id, scaleType: schedule.scaleType, minutes, workingDays });
  }

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    totalMinutes,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    totalWorkingDays,
    bySchedule,
  };
}

module.exports = { listByUser, create, update, remove, getHoursSummary };
