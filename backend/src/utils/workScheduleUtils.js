const { calculateDurationInMinutes } = require('./timeUtils');
const { MS_IN_DAY, startOfDay, addDays } = require('./dateUtils');

// Quantos minutos de trabalho tem um turno, descontando o intervalo.
function calculateDailyWorkMinutes(schedule) {
  const shiftMinutes = calculateDurationInMinutes(schedule.startTime, schedule.endTime);
  return shiftMinutes - (schedule.breakMinutes || 0);
}

// Decide se uma determinada data é dia de trabalho, de acordo com o
// tipo de escala. Todas as datas seguem a convenção do dateUtils
// (meia-noite UTC, getters UTC).
function isWorkingOnDate(schedule, date) {
  if (schedule.scaleType === 'REGULAR') {
    return schedule.daysOfWeek.includes(date.getUTCDay());
  }

  // Folga fixa semanal por cima do ciclo: nesses dias da semana não se
  // trabalha, mesmo que o ciclo diga que seria dia de trabalho. O ciclo
  // continua contando pelo calendário (a folga não "empurra" o ciclo).
  if ((schedule.daysOff || []).includes(date.getUTCDay())) return false;

  // CYCLE: ex. 12x36 -> workDaysInCycle=1, restDaysInCycle=1 (ciclo de 2 dias)
  //        15x2   -> workDaysInCycle=15, restDaysInCycle=2 (ciclo de 17 dias)
  const cycleLength = schedule.workDaysInCycle + schedule.restDaysInCycle;
  const daysSinceStart = Math.round(
    (startOfDay(date) - startOfDay(new Date(schedule.cycleStartDate))) / MS_IN_DAY
  );
  // O módulo pode dar negativo se a data for anterior ao início do ciclo;
  // normalizamos somando cycleLength antes do módulo final.
  const position = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;
  return position < schedule.workDaysInCycle;
}

// Soma os minutos trabalhados num intervalo [from, to], dia a dia.
function calculateWorkedMinutesInRange(schedule, from, to) {
  const dailyMinutes = calculateDailyWorkMinutes(schedule);
  let totalMinutes = 0;
  let workingDays = 0;

  const end = startOfDay(to);
  for (let cursor = startOfDay(from); cursor <= end; cursor = addDays(cursor, 1)) {
    if (isWorkingOnDate(schedule, cursor)) {
      totalMinutes += dailyMinutes;
      workingDays += 1;
    }
  }

  return { totalMinutes, workingDays };
}

module.exports = {
  calculateDailyWorkMinutes,
  isWorkingOnDate,
  calculateWorkedMinutesInRange,
};
