const { timeToMinutes } = require('./timeUtils');
const { minutesToTime } = require('./dashboardUtils');
const { isWorkingOnDate } = require('./workScheduleUtils');

const MINUTES_IN_DAY = 24 * 60;

// Gera os blocos "virtuais" de transporte de uma atividade, a partir
// do commuteMinutes cadastrado nela. Um bloco antes (indo) e um depois
// (voltando) - nenhum dos dois é persistido no banco, são calculados
// toda vez que a rotina do dia é montada.
// Os limites são travados em [0, 1440] pra nunca "vazar" pro dia
// anterior/seguinte caso a atividade seja muito cedo ou muito tarde.
function buildCommuteBlocksForActivity(activity) {
  if (!activity.commuteMinutes) return [];

  const startMinutes = timeToMinutes(activity.startTime);
  const endMinutes = timeToMinutes(activity.endTime);
  const blocks = [];

  const beforeStart = Math.max(startMinutes - activity.commuteMinutes, 0);
  if (beforeStart < startMinutes) {
    blocks.push({
      startTime: minutesToTime(beforeStart),
      endTime: activity.startTime,
      category: 'TRANSPORTE',
    });
  }

  const afterEnd = Math.min(endMinutes + activity.commuteMinutes, MINUTES_IN_DAY);
  if (afterEnd > endMinutes) {
    blocks.push({
      startTime: activity.endTime,
      endTime: minutesToTime(afterEnd),
      category: 'TRANSPORTE',
    });
  }

  return blocks;
}

// Junta as atividades recorrentes do dia (+ seus blocos de transporte
// automáticos) com o bloco de trabalho da escala (se houver), e
// devolve tudo ordenado por horário.
function buildDayBlocks(date, activities, workSchedules) {
  const dayOfWeek = date.getUTCDay();
  const todaysActivities = activities.filter((activity) => activity.daysOfWeek.includes(dayOfWeek));

  const activityBlocks = todaysActivities.map((activity) => ({
    startTime: activity.startTime,
    endTime: activity.endTime,
    category: activity.category,
  }));

  const commuteBlocks = todaysActivities.flatMap(buildCommuteBlocksForActivity);

  const workBlocks = workSchedules
    .filter((schedule) => isWorkingOnDate(schedule, date))
    .map((schedule) => ({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      category: 'TRABALHO',
    }));

  return [...activityBlocks, ...commuteBlocks, ...workBlocks].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
}

function extractCommuteBlocks(dayBlocks) {
  return dayBlocks.filter((block) => block.category === 'TRANSPORTE');
}

module.exports = { buildDayBlocks, extractCommuteBlocks, buildCommuteBlocksForActivity };
