const {
  startOfDay,
  endOfDay,
  getToday,
  addDays,
  getWeekRange,
  getDatesOfWeek,
  getMonthRange,
} = require('../../src/utils/dateUtils');

const iso = (date) => date.toISOString().slice(0, 10);
const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));

describe('dateUtils', () => {
  test('startOfDay zera a hora mantendo o dia de calendário', () => {
    expect(startOfDay(new Date('2026-09-28T15:30:00Z')).toISOString()).toBe('2026-09-28T00:00:00.000Z');
  });

  test('endOfDay devolve o último instante do dia', () => {
    expect(endOfDay(utc(2026, 9, 28)).toISOString()).toBe('2026-09-28T23:59:59.999Z');
  });

  test('getToday devolve meia-noite UTC', () => {
    const today = getToday();
    expect(today.getUTCHours()).toBe(0);
    expect(today.getUTCMinutes()).toBe(0);
  });

  test('addDays atravessa virada de mês', () => {
    expect(iso(addDays(utc(2026, 9, 30), 1))).toBe('2026-10-01');
    expect(iso(addDays(utc(2026, 10, 1), -1))).toBe('2026-09-30');
  });

  test('getWeekRange: a semana vai de segunda a domingo', () => {
    const { monday, sunday } = getWeekRange(utc(2026, 9, 30)); // quarta
    expect(iso(monday)).toBe('2026-09-28');
    expect(iso(sunday)).toBe('2026-10-04');
  });

  test('getWeekRange: a própria segunda abre a semana', () => {
    expect(iso(getWeekRange(utc(2026, 9, 28)).monday)).toBe('2026-09-28');
  });

  test('getWeekRange: o domingo pertence à semana que começou na segunda anterior', () => {
    const { monday, sunday } = getWeekRange(utc(2026, 10, 4));
    expect(iso(monday)).toBe('2026-09-28');
    expect(iso(sunday)).toBe('2026-10-04');
  });

  test('getDatesOfWeek devolve 7 dias consecutivos', () => {
    const dates = getDatesOfWeek(utc(2026, 9, 28));
    expect(dates).toHaveLength(7);
    expect(iso(dates[0])).toBe('2026-09-28');
    expect(iso(dates[6])).toBe('2026-10-04');
  });

  test('getMonthRange respeita meses de tamanhos diferentes e ano bissexto', () => {
    expect(iso(getMonthRange(utc(2026, 2, 15)).end)).toBe('2026-02-28');
    expect(iso(getMonthRange(utc(2028, 2, 15)).end)).toBe('2028-02-29');
    expect(iso(getMonthRange(utc(2026, 9, 10)).start)).toBe('2026-09-01');
  });
});
