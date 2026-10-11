// Converte "07:30" -> 450 (minutos desde 00:00)
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Calcula a duração em minutos entre dois horários "HH:mm".
// Suporta atividades que passam da meia-noite (ex: 23:00 -> 07:00).
function calculateDurationInMinutes(startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end >= start) {
    return end - start;
  }
  // Passou da meia-noite: soma o resto do dia com o início do próximo
  return (24 * 60 - start) + end;
}

// Duas atividades conflitam se compartilham pelo menos um dia da
// semana E seus intervalos de horário se sobrepõem.
function activitiesConflict(activityA, activityB) {
  const shareDay = activityA.daysOfWeek.some((day) =>
    activityB.daysOfWeek.includes(day)
  );
  if (!shareDay) return false;

  const startA = timeToMinutes(activityA.startTime);
  const endA = timeToMinutes(activityA.endTime);
  const startB = timeToMinutes(activityB.startTime);
  const endB = timeToMinutes(activityB.endTime);

  return startA < endB && startB < endA;
}

module.exports = { timeToMinutes, calculateDurationInMinutes, activitiesConflict };
