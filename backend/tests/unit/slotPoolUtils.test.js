const { createTimePool } = require('../../src/utils/slotPoolUtils');

describe('createTimePool', () => {
  test('reserva do início da janela e encolhe o que resta', () => {
    const pool = createTimePool([{ start: '18:00', end: '19:00' }]);
    expect(pool.claim(30)).toEqual({ startTime: '18:00', endTime: '18:30' });
    expect(pool.claim(30)).toEqual({ startTime: '18:30', endTime: '19:00' });
  });

  test('devolve null quando não sobra espaço suficiente', () => {
    const pool = createTimePool([{ start: '18:00', end: '18:20' }]);
    expect(pool.claim(30)).toBeNull();
  });

  test('pula pra próxima janela quando a primeira não serve', () => {
    const pool = createTimePool([
      { start: '08:00', end: '08:10' }, // pequena demais pra 30min
      { start: '20:00', end: '21:00' },
    ]);
    expect(pool.claim(30)).toEqual({ startTime: '20:00', endTime: '20:30' });
  });

  test('pool vazio nunca reserva nada', () => {
    const pool = createTimePool([]);
    expect(pool.claim(10)).toBeNull();
  });
});
