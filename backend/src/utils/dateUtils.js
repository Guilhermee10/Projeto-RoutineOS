// CONVENÇÃO DO PROJETO: toda "data de calendário" (dia da semana, início
// de escala, data de um registro de sono...) é representada como um Date
// à meia-noite UTC, e todo código usa os getters UTC (getUTCDay etc).
// É o que acontece naturalmente quando a API recebe "2026-09-28"
// (new Date("2026-09-28") = meia-noite UTC), e evita que o resultado
// mude dependendo do fuso horário do servidor.

const MS_IN_DAY = 24 * 60 * 60 * 1000;

// Zera a hora, mantendo só o dia de calendário (em UTC).
function startOfDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Último instante do dia (23:59:59.999 UTC) - útil como limite superior
// inclusivo em filtros de período.
function endOfDay(date) {
  return new Date(startOfDay(date).getTime() + MS_IN_DAY - 1);
}

// "Hoje" segundo o calendário do relógio do servidor. Por isso o
// servidor deve rodar com TZ configurado (ex: TZ=America/Bahia); senão
// "hoje" seria o dia em UTC, que vira o dia seguinte às 21h no Brasil.
function getToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_IN_DAY);
}

// Dada uma data qualquer, devolve a segunda-feira e o domingo daquela
// semana. Convenção adotada no projeto: a semana começa na segunda.
function getWeekRange(referenceDate = getToday()) {
  const date = startOfDay(referenceDate);
  const diffToMonday = (date.getUTCDay() + 6) % 7; // 0 = domingo
  const monday = addDays(date, -diffToMonday);
  const sunday = addDays(monday, 6);
  return { monday, sunday };
}

// Gera um array com as 7 datas de uma semana, de segunda a domingo.
function getDatesOfWeek(monday) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

function getMonthRange(referenceDate = getToday()) {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 0)),
  };
}

module.exports = {
  MS_IN_DAY,
  startOfDay,
  endOfDay,
  getToday,
  addDays,
  getWeekRange,
  getDatesOfWeek,
  getMonthRange,
};
