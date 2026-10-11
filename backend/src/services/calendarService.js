const activityRepository = require('../repositories/activityRepository');
const workScheduleRepository = require('../repositories/workScheduleRepository');
const scheduledSlotRepository = require('../repositories/scheduledSlotRepository');
const { buildCommuteBlocksForActivity } = require('../utils/dayBlocksUtils');
const { isWorkingOnDate } = require('../utils/workScheduleUtils');
const { calculateDurationInMinutes } = require('../utils/timeUtils');
const { getWeekRange, getDatesOfWeek, endOfDay, getToday } = require('../utils/dateUtils');

// Monta a visão de calendário de UM dia, juntando as 4 fontes de
// bloco que o projeto já tem: atividades recorrentes, deslocamento
// automático (commuteMinutes), turno de trabalho, e metas flexíveis
// já CONFIRMADAS pelo motor de otimização (sugestão ainda não vale).
function buildDayCalendar(date, activities, workSchedules, confirmedSlotsByDate) {
  const dayOfWeek = date.getUTCDay();
  const dateKey = date.toISOString().slice(0, 10);
  const todaysActivities = activities.filter((a) => a.daysOfWeek.includes(dayOfWeek));

  const activityBlocks = todaysActivities.map((activity) => ({
    id: activity.id,
    name: activity.name,
    category: activity.category,
    startTime: activity.startTime,
    endTime: activity.endTime,
    source: 'ACTIVITY',
  }));

  const commuteBlocks = todaysActivities.flatMap((activity) =>
    buildCommuteBlocksForActivity(activity).map((block, index) => ({
      id: `${activity.id}-commute-${index}`,
      name: `Deslocamento · ${activity.name}`,
      category: 'TRANSPORTE',
      startTime: block.startTime,
      endTime: block.endTime,
      source: 'ACTIVITY_COMMUTE',
    }))
  );

  const workBlocks = workSchedules
    .filter((schedule) => isWorkingOnDate(schedule, date))
    .map((schedule) => ({
      id: schedule.id,
      name: 'Trabalho',
      category: 'TRABALHO',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      source: 'WORK_SCHEDULE',
    }));

  const goalBlocks = (confirmedSlotsByDate[dateKey] || []).map((slot) => ({
    id: slot.id,
    name: slot.flexibleGoal.name,
    category: slot.flexibleGoal.activityType,
    startTime: slot.startTime,
    endTime: slot.endTime,
    source: slot.duringCommute ? 'FLEXIBLE_GOAL_COMMUTE' : 'FLEXIBLE_GOAL',
  }));

  const blocks = [...activityBlocks, ...commuteBlocks, ...workBlocks, ...goalBlocks]
    .map((block) => ({
      ...block,
      durationMinutes: calculateDurationInMinutes(block.startTime, block.endTime),
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return { date: dateKey, dayOfWeek, blocks };
}

async function getWeeklyCalendar(userId, referenceDateString) {
  const referenceDate = referenceDateString ? new Date(referenceDateString) : getToday();
  const { monday, sunday } = getWeekRange(referenceDate);
  const dates = getDatesOfWeek(monday);

  const [activities, workSchedules, confirmedSlots] = await Promise.all([
    activityRepository.findAllByUser(userId),
    workScheduleRepository.findAllByUser(userId),
    scheduledSlotRepository.findAllByUser(userId, {
      status: 'CONFIRMED',
      from: monday,
      to: endOfDay(sunday),
    }),
  ]);

  const confirmedSlotsByDate = confirmedSlots.reduce((acc, slot) => {
    const key = slot.date.toISOString().slice(0, 10);
    (acc[key] ||= []).push(slot);
    return acc;
  }, {});

  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
    days: dates.map((date) => buildDayCalendar(date, activities, workSchedules, confirmedSlotsByDate)),
  };
}

module.exports = { getWeeklyCalendar };
