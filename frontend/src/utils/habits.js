// Lógica pura dos hábitos da semana: monta a grade (estado de cada célula)
// e calcula os percentuais que alimentam o Dashboard e o índice de rotina.

export const checkInKey = (activityId, dateStr) => `${activityId}|${dateStr}`;

export function dayOfWeekOf(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

const STUDY_CATEGORIES = ['ESTUDO', 'FACULDADE'];
const WORKOUT_CATEGORIES = ['TREINO'];

const percentOf = ({ planned, done }) => (planned > 0 ? Math.round((done / planned) * 100) : null);

// Regra de contagem ("até hoje, com tolerância pro dia corrente"):
//  - dias anteriores a hoje entram sempre (feito ou não);
//  - HOJE só entra se já foi marcado. Assim, de manhã, hábitos que ainda
//    nem dava pra ter feito não derrubam a nota; e dias futuros nunca contam.
export function computeHabitStats({ activities, checkedSet, weekDates, todayStr }) {
  const rows = activities.map((activity) => {
    let planned = 0;
    let done = 0;

    const cells = weekDates.map((date) => {
      if (!activity.daysOfWeek.includes(dayOfWeekOf(date))) {
        return { date, state: 'none', isToday: date === todayStr, isFuture: date > todayStr };
      }
      const checked = checkedSet.has(checkInKey(activity.id, date));
      const counts = date < todayStr || (date === todayStr && checked);
      if (counts) {
        planned += 1;
        if (checked) done += 1;
      }
      return {
        date,
        state: checked ? 'done' : 'pending',
        isToday: date === todayStr,
        isFuture: date > todayStr,
      };
    });

    return { activity, cells, planned, done };
  });

  const sum = (predicate) =>
    rows
      .filter((row) => predicate(row.activity))
      .reduce((acc, row) => ({ planned: acc.planned + row.planned, done: acc.done + row.done }), {
        planned: 0,
        done: 0,
      });

  const total = sum(() => true);
  const study = sum((a) => STUDY_CATEGORIES.includes(a.category));
  const workout = sum((a) => WORKOUT_CATEGORIES.includes(a.category));

  // Quantos hábitos de HOJE ainda estão pendentes (pra sugestões)
  const todayPending = rows.filter((row) => row.cells.some((c) => c.isToday && c.state === 'pending')).length;
  const todayPlanned = rows.filter((row) => row.cells.some((c) => c.isToday && c.state !== 'none')).length;

  return {
    rows,
    total: { ...total, percent: percentOf(total) },
    study: { ...study, percent: percentOf(study) },
    workout: { ...workout, percent: percentOf(workout) },
    today: { planned: todayPlanned, pending: todayPending },
  };
}
