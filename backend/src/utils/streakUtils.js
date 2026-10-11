const { addDays, startOfDay } = require('./dateUtils');

function toDateKey(dateLike) {
  return startOfDay(new Date(dateLike)).toISOString().slice(0, 10);
}

// Recebe uma lista de datas (strings ou Date) em que algo foi
// registrado, e devolve o streak ATUAL (contando pra trás a partir de
// hoje - ou de ontem, se hoje ainda não tiver registro, pra não zerar
// o streak só porque o dia ainda não acabou) e o MAIOR streak já
// alcançado (olhando o histórico inteiro).
function calculateStreaks(dates, referenceDate = new Date()) {
  const uniqueDays = Array.from(new Set(dates.map(toDateKey))).sort();

  if (uniqueDays.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Maior streak: varre os dias em ordem, soma 1 enquanto cada dia for
  // exatamente o seguinte do anterior; reinicia quando há um buraco.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const diffDays = Math.round(
      (new Date(uniqueDays[i]) - new Date(uniqueDays[i - 1])) / 86_400_000
    );
    run = diffDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // Streak atual: começa em hoje (ou ontem, se hoje ainda não tem
  // registro) e anda pra trás enquanto os dias forem consecutivos.
  const daySet = new Set(uniqueDays);
  const today = startOfDay(referenceDate);
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));

  let cursor;
  if (daySet.has(todayKey)) {
    cursor = today;
  } else if (daySet.has(yesterdayKey)) {
    cursor = addDays(today, -1);
  } else {
    return { current: 0, longest };
  }

  let current = 0;
  while (daySet.has(toDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest };
}

module.exports = { calculateStreaks };
