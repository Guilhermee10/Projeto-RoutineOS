const activityRepository = require('../repositories/activityRepository');
const workScheduleRepository = require('../repositories/workScheduleRepository');
const activityCheckInRepository = require('../repositories/activityCheckInRepository');
const { calculateDurationInMinutes } = require('../utils/timeUtils');
const { isWorkingOnDate } = require('../utils/workScheduleUtils');
const { buildDayBlocks, buildCommuteBlocksForActivity } = require('../utils/dayBlocksUtils');
const { calculateCategoryTotals, calculateFreeSlots } = require('../utils/dashboardUtils');
const { WAKING_WINDOW } = require('../config/schedule');
const { startOfDay, getToday } = require('../utils/dateUtils');

async function getDailySummary(userId, dateString) {
  const date = dateString ? startOfDay(new Date(dateString)) : getToday();
  const dayOfWeek = date.getUTCDay(); // 0 = domingo ... 6 = sábado

  const [allActivities, workSchedules, checkIns] = await Promise.all([
    activityRepository.findAllByUser(userId),
    workScheduleRepository.findAllByUser(userId),
    activityCheckInRepository.findAllByUserAndDate(userId, date),
  ]);

  const checkedInActivityIds = new Set(checkIns.map((c) => c.activityId));
  const todaysActivities = allActivities.filter((activity) => activity.daysOfWeek.includes(dayOfWeek));

  // Agenda do dia: atividades recorrentes + turnos de trabalho da escala
  // + os blocos de transporte "virtuais" gerados a partir do
  // commuteMinutes de cada atividade (não existem no banco, só aqui).
  //
  // Só as atividades "de verdade" (activityEntries) são "checkable" -
  // turno de trabalho e bloco de transporte virtual não têm uma
  // Activity própria pra vincular um check-in.
  const activityEntries = todaysActivities.map((activity) => ({
    ...activity,
    durationMinutes: calculateDurationInMinutes(activity.startTime, activity.endTime),
    checkable: true,
    completed: checkedInActivityIds.has(activity.id),
  }));

  const commuteEntries = todaysActivities.flatMap((activity) =>
    buildCommuteBlocksForActivity(activity).map((block, index) => ({
      id: `${activity.id}-commute-${index}`,
      name: `Deslocamento · ${activity.name}`,
      category: 'TRANSPORTE',
      startTime: block.startTime,
      endTime: block.endTime,
      durationMinutes: calculateDurationInMinutes(block.startTime, block.endTime),
      source: 'ACTIVITY_COMMUTE',
      checkable: false,
    }))
  );

  const workEntries = workSchedules
    .filter((schedule) => isWorkingOnDate(schedule, date))
    .map((schedule) => ({
      id: schedule.id,
      name: 'Trabalho',
      category: 'TRABALHO',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      durationMinutes: calculateDurationInMinutes(schedule.startTime, schedule.endTime),
      source: 'WORK_SCHEDULE',
      checkable: false,
    }));

  const agenda = [...activityEntries, ...commuteEntries, ...workEntries].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // Totais e espaços livres usam os mesmos blocos do motor de otimização,
  // então dashboard, relatório e sugestões sempre concordam entre si.
  const blocks = buildDayBlocks(date, allActivities, workSchedules);
  const categoryTotals = calculateCategoryTotals(blocks);
  const freeSlots = calculateFreeSlots(blocks, WAKING_WINDOW);
  const freeMinutesTotal = freeSlots.reduce((sum, slot) => sum + slot.durationMinutes, 0);

  return {
    date: date.toISOString().slice(0, 10),
    dayOfWeek,
    activities: agenda,
    categoryTotals,
    freeSlots,
    freeMinutesTotal,
  };
}

module.exports = { getDailySummary };
