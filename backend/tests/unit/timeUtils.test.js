const {
  timeToMinutes,
  calculateDurationInMinutes,
  activitiesConflict,
} = require('../../src/utils/timeUtils');

describe('timeToMinutes', () => {
  test('converte HH:mm em minutos desde a meia-noite', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('07:30')).toBe(450);
    expect(timeToMinutes('23:59')).toBe(1439);
  });
});

describe('calculateDurationInMinutes', () => {
  test('calcula duração dentro do mesmo dia', () => {
    expect(calculateDurationInMinutes('09:00', '10:30')).toBe(90);
  });

  test('sono de 23:00 às 07:00 dura 8 horas (cruza a meia-noite)', () => {
    expect(calculateDurationInMinutes('23:00', '07:00')).toBe(480);
    expect(calculateDurationInMinutes('22:00', '02:30')).toBe(270);
  });

  test('início igual ao fim resulta em zero', () => {
    expect(calculateDurationInMinutes('10:00', '10:00')).toBe(0);
  });
});

describe('activitiesConflict', () => {
  const base = { daysOfWeek: [1], startTime: '09:00', endTime: '10:00' };

  test('detecta sobreposição parcial no mesmo dia', () => {
    const other = { daysOfWeek: [1], startTime: '09:30', endTime: '11:00' };
    expect(activitiesConflict(base, other)).toBe(true);
  });

  test('detecta atividade contida dentro da outra', () => {
    const other = { daysOfWeek: [1], startTime: '09:15', endTime: '09:45' };
    expect(activitiesConflict(base, other)).toBe(true);
  });

  test('atividades em sequência (uma termina quando a outra começa) não conflitam', () => {
    const other = { daysOfWeek: [1], startTime: '10:00', endTime: '11:00' };
    expect(activitiesConflict(base, other)).toBe(false);
  });

  test('mesmo horário em dias diferentes não conflita', () => {
    const other = { daysOfWeek: [2], startTime: '09:00', endTime: '10:00' };
    expect(activitiesConflict(base, other)).toBe(false);
  });

  test('conflita se compartilham ao menos um dia da semana', () => {
    const other = { daysOfWeek: [2, 1, 5], startTime: '09:30', endTime: '10:30' };
    expect(activitiesConflict(base, other)).toBe(true);
  });
});
