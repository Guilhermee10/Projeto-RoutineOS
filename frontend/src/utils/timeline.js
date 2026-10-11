// Lógica pura da agenda do dia: estado de cada item (feito, atual,
// pendente...) e tempo livre que ainda resta.

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToHHmm = (total) =>
  `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

// dayRelation: 'today' | 'past' | 'future' (relação do dia exibido com hoje)
// nowMinutes: minutos desde 00:00 agora (só usado quando dayRelation === 'today')
export function decorateTimeline(items, { nowMinutes, dayRelation }) {
  let nextMarked = false;

  return items.map((item) => {
    const start = toMinutes(item.startTime);
    let end = toMinutes(item.endTime);
    if (end <= start) end += 1440; // cruza a meia-noite

    let status;
    let isCurrent = false;
    let isNext = false;

    if (item.completed) status = 'done';
    else if (dayRelation === 'past') status = item.checkable ? 'pending' : 'passed';
    else if (dayRelation === 'future') status = 'upcoming';
    else if (end <= nowMinutes) status = item.checkable ? 'pending' : 'passed';
    else if (start <= nowMinutes) status = 'active';
    else status = 'upcoming';

    if (dayRelation === 'today') {
      isCurrent = start <= nowMinutes && nowMinutes < end;
      if (!isCurrent && !nextMarked && start > nowMinutes) {
        isNext = true;
        nextMarked = true;
      }
    }

    return { ...item, status, isCurrent, isNext };
  });
}

// Só o tempo livre que ainda dá pra usar: corta o que já passou e
// descarta lacunas curtas demais pra serem úteis (< minMinutes).
export function getRemainingFreeSlots(slots, { nowMinutes = null, minMinutes = 15 } = {}) {
  return slots
    .map((slot) => {
      const end = toMinutes(slot.end);
      const start = nowMinutes === null ? toMinutes(slot.start) : Math.max(toMinutes(slot.start), nowMinutes);
      return { start, end };
    })
    .filter(({ start, end }) => end - start >= minMinutes)
    .map(({ start, end }) => ({
      start: minutesToHHmm(start),
      end: end >= 1440 ? '24:00' : minutesToHHmm(end),
      durationMinutes: end - start,
    }));
}

const PRIORITY_WEIGHT = { ALTA: 3, MEDIA: 2, BAIXA: 1 };

// Quais metas flexíveis cabem num espaço livre (encaixe guloso: prioridade
// mais alta primeiro, depois as mais longas).
export function fitGoalsInSlot(slotMinutes, flexibleGoals) {
  const sorted = [...flexibleGoals].sort(
    (a, b) =>
      (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0) ||
      b.durationMinutes - a.durationMinutes
  );
  let remaining = slotMinutes;
  const picks = [];
  for (const goal of sorted) {
    if (goal.durationMinutes <= remaining) {
      picks.push(goal);
      remaining -= goal.durationMinutes;
    }
  }
  return picks;
}
