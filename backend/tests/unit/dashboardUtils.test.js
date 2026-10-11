const {
  calculateCategoryTotals,
  calculateFreeSlots,
  minutesToTime,
} = require('../../src/utils/dashboardUtils');

const block = (startTime, endTime, category = 'OUTROS') => ({ startTime, endTime, category });

describe('calculateCategoryTotals', () => {
  test('soma os minutos por categoria', () => {
    const totals = calculateCategoryTotals([
      block('09:00', '18:00', 'TRABALHO'),
      block('07:00', '08:00', 'ESTUDO'),
      block('19:00', '19:30', 'ESTUDO'),
    ]);
    expect(totals).toEqual({ TRABALHO: 540, ESTUDO: 90 });
  });

  test('lista vazia devolve objeto vazio', () => {
    expect(calculateCategoryTotals([])).toEqual({});
  });
});

describe('minutesToTime', () => {
  test('formata minutos como HH:mm', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(450)).toBe('07:30');
  });

  test('o fim do dia é "24:00", não "00:00"', () => {
    expect(minutesToTime(1440)).toBe('24:00');
  });
});

describe('calculateFreeSlots', () => {
  test('dia inteiro: devolve o que sobra antes e depois da atividade', () => {
    expect(calculateFreeSlots([block('09:00', '18:00')])).toEqual([
      { start: '00:00', end: '09:00', durationMinutes: 540 },
      { start: '18:00', end: '24:00', durationMinutes: 360 },
    ]);
  });

  test('respeita a janela de horário acordado', () => {
    const window = { dayStart: '06:00', dayEnd: '23:00' };
    expect(calculateFreeSlots([block('09:00', '18:00')], window)).toEqual([
      { start: '06:00', end: '09:00', durationMinutes: 180 },
      { start: '18:00', end: '23:00', durationMinutes: 300 },
    ]);
  });

  test('sem atividades, o tempo livre é a janela inteira', () => {
    const slots = calculateFreeSlots([], { dayStart: '06:00', dayEnd: '23:00' });
    expect(slots).toEqual([{ start: '06:00', end: '23:00', durationMinutes: 1020 }]);
  });

  test('atividade totalmente fora da janela não altera o tempo livre', () => {
    const slots = calculateFreeSlots([block('00:00', '05:00')], { dayStart: '06:00', dayEnd: '23:00' });
    expect(slots).toEqual([{ start: '06:00', end: '23:00', durationMinutes: 1020 }]);
  });

  test('dia lotado devolve lista vazia', () => {
    const slots = calculateFreeSlots([block('05:00', '23:30')], { dayStart: '06:00', dayEnd: '23:00' });
    expect(slots).toEqual([]);
  });

  test('ordena atividades fora de ordem e acha os intervalos entre elas', () => {
    const slots = calculateFreeSlots(
      [block('18:00', '20:00'), block('08:00', '09:00')],
      { dayStart: '06:00', dayEnd: '23:00' }
    );
    expect(slots.map((s) => `${s.start}-${s.end}`)).toEqual(['06:00-08:00', '09:00-18:00', '20:00-23:00']);
  });

  test('intervalo pequeno entre atividades também é reportado', () => {
    const slots = calculateFreeSlots(
      [block('08:00', '08:50'), block('09:00', '18:00')],
      { dayStart: '06:00', dayEnd: '23:00' }
    );
    expect(slots).toContainEqual({ start: '08:50', end: '09:00', durationMinutes: 10 });
  });
});
