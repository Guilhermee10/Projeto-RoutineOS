const activityRepository = require('../repositories/activityRepository');
const workScheduleRepository = require('../repositories/workScheduleRepository');
const sleepRepository = require('../repositories/sleepRepository');
const studyRepository = require('../repositories/studyRepository');
const workoutRepository = require('../repositories/workoutRepository');
const scheduledSlotRepository = require('../repositories/scheduledSlotRepository');

const { getWeekRange, getDatesOfWeek, addDays, endOfDay, getToday } = require('../utils/dateUtils');
const { calculateDurationInMinutes } = require('../utils/timeUtils');
const { calculateAverage } = require('../utils/statsUtils');
const { buildDayBlocks } = require('../utils/dayBlocksUtils');
const { calculateCategoryTotals, calculateFreeSlots } = require('../utils/dashboardUtils');
const { WAKING_WINDOW } = require('../config/schedule');

// Nota de arquitetura: esse service lê direto de VÁRIOS repositories
// de domínios diferentes (sono, estudo, treino, atividades...). Isso é
// aceitável aqui porque um relatório é, por natureza, uma "leitura
// agregada" que atravessa domínios - ele não seria um bom lugar pra
// colocar regra de negócio de escrita.

// Trabalho e transporte não têm uma entidade de "log" dedicada -
// usamos o que está AGENDADO (Activity + WorkSchedule) como fonte,
// reaproveitando a mesma lógica de blocos do motor de otimização.
async function aggregateScheduledTime(userId, from, to) {
  const [activities, workSchedules] = await Promise.all([
    activityRepository.findAllByUser(userId),
    workScheduleRepository.findAllByUser(userId),
  ]);

  let workMinutes = 0;
  let commuteMinutes = 0;
  let freeMinutesTotal = 0;
  let biggestFreeSlot = null;

  for (const date of getDatesOfWeek(from)) {
    if (date > to) break;
    const blocks = buildDayBlocks(date, activities, workSchedules);
    const totals = calculateCategoryTotals(blocks);
    workMinutes += totals.TRABALHO || 0;
    commuteMinutes += totals.TRANSPORTE || 0;

    const freeSlots = calculateFreeSlots(blocks, WAKING_WINDOW);
    freeMinutesTotal += freeSlots.reduce((sum, slot) => sum + slot.durationMinutes, 0);

    for (const slot of freeSlots) {
      if (!biggestFreeSlot || slot.durationMinutes > biggestFreeSlot.durationMinutes) {
        biggestFreeSlot = { ...slot, date: date.toISOString().slice(0, 10) };
      }
    }
  }

  return { workMinutes, commuteMinutes, freeMinutesTotal, biggestFreeSlot };
}

// Sono, estudo e treino têm registro real (log) - usamos os dados
// efetivamente lançados pelo usuário, não o planejado.
async function aggregateLoggedData(userId, from, to) {
  const range = { from, to: endOfDay(to) }; // inclui o dia final inteiro
  const [sleepRecords, studySessions, workouts] = await Promise.all([
    sleepRepository.findAllByUser(userId, range),
    studyRepository.findAllByUser(userId, range),
    workoutRepository.findAllByUser(userId, range),
  ]);

  const sleepDurations = sleepRecords.map((r) =>
    calculateDurationInMinutes(r.wentToSleepAt, r.wokeUpAt)
  );

  return {
    sleepAverageMinutes: Math.round(calculateAverage(sleepDurations)),
    studyTotalMinutes: studySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    workoutTotalMinutes: workouts.reduce((sum, w) => sum + w.durationMinutes, 0),
    workoutCount: workouts.length,
  };
}

async function getWeeklyReport(userId, referenceDateString) {
  const referenceDate = referenceDateString ? new Date(referenceDateString) : getToday();
  const { monday, sunday } = getWeekRange(referenceDate);
  const previousMonday = addDays(monday, -7);
  const previousSunday = addDays(sunday, -7);

  const [scheduled, logged, previousLogged, confirmedSlots] = await Promise.all([
    aggregateScheduledTime(userId, monday, sunday),
    aggregateLoggedData(userId, monday, sunday),
    aggregateLoggedData(userId, previousMonday, previousSunday),
    scheduledSlotRepository.findAllByUser(userId, { status: 'CONFIRMED', from: monday, to: endOfDay(sunday) }),
  ]);

  // Quanto do tempo livre da semana já está ocupado por metas
  // CONFIRMADAS (sugestões durante o transporte não contam, porque
  // elas não "gastam" tempo livre de verdade).
  const goalMinutesUsed = confirmedSlots
    .filter((slot) => !slot.duringCommute)
    .reduce((sum, slot) => sum + calculateDurationInMinutes(slot.startTime, slot.endTime), 0);

  const goalsUsagePercentage = scheduled.freeMinutesTotal > 0
    ? Math.round((goalMinutesUsed / scheduled.freeMinutesTotal) * 100)
    : 0;

  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
    sleep: { averageMinutes: logged.sleepAverageMinutes },
    study: {
      totalMinutes: logged.studyTotalMinutes,
      diffFromPreviousWeekMinutes: logged.studyTotalMinutes - previousLogged.studyTotalMinutes,
    },
    workouts: { totalMinutes: logged.workoutTotalMinutes, count: logged.workoutCount },
    work: { totalMinutes: scheduled.workMinutes },
    commute: { totalMinutes: scheduled.commuteMinutes },
    freeTime: {
      totalMinutes: scheduled.freeMinutesTotal,
      biggestWindow: scheduled.biggestFreeSlot,
    },
    goalsUsagePercentage,
  };
}

module.exports = { getWeeklyReport };
