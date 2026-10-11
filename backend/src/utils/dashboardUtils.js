const { calculateDurationInMinutes, timeToMinutes } = require('./timeUtils');

const MINUTES_IN_DAY = 24 * 60;

// Soma quantos minutos foram gastos em cada categoria naquele dia.
// Ex: { SONO: 480, ESTUDO: 120, TRABALHO: 360 }
function calculateCategoryTotals(activities) {
  return activities.reduce((totals, activity) => {
    const duration = calculateDurationInMinutes(activity.startTime, activity.endTime);
    totals[activity.category] = (totals[activity.category] || 0) + duration;
    return totals;
  }, {});
}

// Dado o dia já sem conflitos (a checagem acontece na criação da
// atividade), calcula os intervalos livres entre elas, dentro da
// janela [dayStart, dayEnd] (padrão: o dia inteiro).
// Limitação conhecida: não trata atividades que cruzam a meia-noite
// nesse cálculo específico de espaços livres do dia.
function calculateFreeSlots(activities, { dayStart = '00:00', dayEnd = '24:00' } = {}) {
  const windowStart = timeToMinutes(dayStart);
  const windowEnd = timeToMinutes(dayEnd);

  const sorted = [...activities].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const freeSlots = [];
  let cursor = windowStart;

  for (const activity of sorted) {
    if (cursor >= windowEnd) break;

    const start = timeToMinutes(activity.startTime);
    const end = timeToMinutes(activity.endTime);

    if (start > cursor) {
      freeSlots.push({ startMinutes: cursor, endMinutes: Math.min(start, windowEnd) });
    }
    cursor = Math.max(cursor, end);
  }

  if (cursor < windowEnd) {
    freeSlots.push({ startMinutes: cursor, endMinutes: windowEnd });
  }

  return freeSlots.map((slot) => ({
    start: minutesToTime(slot.startMinutes),
    end: minutesToTime(slot.endMinutes),
    durationMinutes: slot.endMinutes - slot.startMinutes,
  }));
}

function minutesToTime(totalMinutes) {
  // O fim do dia (minuto 1440) precisa ser "24:00", não "00:00" -
  // senão um espaço livre "18:00 -> fim do dia" pareceria terminar
  // ANTES de começar quando convertido de volta em minutos.
  if (totalMinutes === MINUTES_IN_DAY) return '24:00';
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

module.exports = { calculateCategoryTotals, calculateFreeSlots, minutesToTime };
