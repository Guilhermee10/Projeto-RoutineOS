const { calculateStreaks } = require('../../src/utils/streakUtils');

const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));

describe('calculateStreaks', () => {
  test('dias consecutivos até hoje', () => {
    const dates = [utc(2026, 10, 1), utc(2026, 10, 2), utc(2026, 10, 3)];
    expect(calculateStreaks(dates, utc(2026, 10, 3))).toEqual({ current: 3, longest: 3 });
  });

  test('sem registro hoje, mas ontem sim - streak não zera', () => {
    const dates = [utc(2026, 10, 1), utc(2026, 10, 2)];
    expect(calculateStreaks(dates, utc(2026, 10, 3))).toEqual({ current: 2, longest: 2 });
  });

  test('buraco no meio do histórico reinicia a contagem pro "longest"', () => {
    const dates = [utc(2026, 10, 1), utc(2026, 10, 2), utc(2026, 10, 4), utc(2026, 10, 5)];
    expect(calculateStreaks(dates, utc(2026, 10, 5))).toEqual({ current: 2, longest: 2 });
  });

  test('lista vazia devolve zero em ambos', () => {
    expect(calculateStreaks([], utc(2026, 10, 5))).toEqual({ current: 0, longest: 0 });
  });

  test('streak quebrado há mais de um dia: current zera, longest preserva o histórico', () => {
    const dates = [utc(2026, 10, 1), utc(2026, 10, 2)];
    expect(calculateStreaks(dates, utc(2026, 10, 5))).toEqual({ current: 0, longest: 2 });
  });

  test('ignora datas duplicadas e fora de ordem', () => {
    const dates = [utc(2026, 10, 3), utc(2026, 10, 1), utc(2026, 10, 2), utc(2026, 10, 2)];
    expect(calculateStreaks(dates, utc(2026, 10, 3))).toEqual({ current: 3, longest: 3 });
  });

  test('um streak mais longo no passado é maior que o atual', () => {
    const dates = [
      utc(2026, 9, 1), utc(2026, 9, 2), utc(2026, 9, 3), utc(2026, 9, 4), utc(2026, 9, 5),
      utc(2026, 10, 3),
    ];
    expect(calculateStreaks(dates, utc(2026, 10, 3))).toEqual({ current: 1, longest: 5 });
  });
});
