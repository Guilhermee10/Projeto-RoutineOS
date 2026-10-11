const {
  calculateDailyWorkMinutes,
  isWorkingOnDate,
  calculateWorkedMinutesInRange,
} = require('../../src/utils/workScheduleUtils');

const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));

describe('calculateDailyWorkMinutes', () => {
  test('desconta o intervalo do turno', () => {
    const schedule = { startTime: '09:00', endTime: '18:00', breakMinutes: 60 };
    expect(calculateDailyWorkMinutes(schedule)).toBe(480); // 9h - 1h
  });
});

describe('isWorkingOnDate - escala REGULAR', () => {
  const schedule = { scaleType: 'REGULAR', daysOfWeek: [1, 2, 3, 4, 5] };

  test('segunda a sexta são dias de trabalho', () => {
    expect(isWorkingOnDate(schedule, utc(2026, 9, 28))).toBe(true); // segunda
    expect(isWorkingOnDate(schedule, utc(2026, 10, 2))).toBe(true); // sexta
  });

  test('fim de semana não é dia de trabalho', () => {
    expect(isWorkingOnDate(schedule, utc(2026, 10, 3))).toBe(false); // sábado
    expect(isWorkingOnDate(schedule, utc(2026, 10, 4))).toBe(false); // domingo
  });
});

describe('isWorkingOnDate - escala CYCLE (12x36)', () => {
  // workDaysInCycle=1, restDaysInCycle=1 -> alterna todo dia
  const schedule = {
    scaleType: 'CYCLE',
    cycleStartDate: utc(2026, 9, 1),
    workDaysInCycle: 1,
    restDaysInCycle: 1,
  };

  test('o próprio dia de início é dia de trabalho', () => {
    expect(isWorkingOnDate(schedule, utc(2026, 9, 1))).toBe(true);
  });

  test('alterna corretamente trabalho/folga', () => {
    expect(isWorkingOnDate(schedule, utc(2026, 9, 2))).toBe(false);
    expect(isWorkingOnDate(schedule, utc(2026, 9, 3))).toBe(true);
    expect(isWorkingOnDate(schedule, utc(2026, 9, 4))).toBe(false);
  });

  test('funciona também para datas ANTERIORES ao início do ciclo', () => {
    expect(isWorkingOnDate(schedule, utc(2026, 8, 31))).toBe(false);
    expect(isWorkingOnDate(schedule, utc(2026, 8, 30))).toBe(true);
  });
});

describe('isWorkingOnDate - escala CYCLE (15x2)', () => {
  const schedule = {
    scaleType: 'CYCLE',
    cycleStartDate: utc(2026, 9, 1),
    workDaysInCycle: 15,
    restDaysInCycle: 2,
  };

  test('trabalha do dia 1 ao 15 do ciclo', () => {
    expect(isWorkingOnDate(schedule, utc(2026, 9, 1))).toBe(true);
    expect(isWorkingOnDate(schedule, utc(2026, 9, 15))).toBe(true);
  });

  test('folga nos dias 16 e 17 do ciclo, e reinicia no 18', () => {
    expect(isWorkingOnDate(schedule, utc(2026, 9, 16))).toBe(false);
    expect(isWorkingOnDate(schedule, utc(2026, 9, 17))).toBe(false);
    expect(isWorkingOnDate(schedule, utc(2026, 9, 18))).toBe(true);
  });
});

describe('calculateWorkedMinutesInRange', () => {
  test('escala REGULAR numa semana cheia (seg-sex, 9h-18h com 1h de almoço)', () => {
    const schedule = {
      scaleType: 'REGULAR',
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '18:00',
      breakMinutes: 60,
    };
    const result = calculateWorkedMinutesInRange(schedule, utc(2026, 9, 28), utc(2026, 10, 4));
    expect(result).toEqual({ totalMinutes: 2400, workingDays: 5 }); // 480min x 5 dias
  });

  test('escala 12x36 numa semana de 7 dias tem 3 dias de trabalho (alternando a partir de 01/09)', () => {
    const schedule = {
      scaleType: 'CYCLE',
      cycleStartDate: utc(2026, 9, 1),
      workDaysInCycle: 1,
      restDaysInCycle: 1,
      startTime: '07:00',
      endTime: '19:00',
      breakMinutes: 60,
    };
    // A partir de 01/09 (trabalha), o padrão par/ímpar faz a semana
    // 28/09-04/10 cair em: 29/09, 01/10 e 03/10 como dias de trabalho.
    const result = calculateWorkedMinutesInRange(schedule, utc(2026, 9, 28), utc(2026, 10, 4));
    expect(result.workingDays).toBe(3);
    expect(result.totalMinutes).toBe(3 * 660); // 12h - 1h de intervalo = 660min
  });
});

describe('isWorkingOnDate - CYCLE com folgas fixas (daysOff)', () => {
  // 15x2 começando numa segunda (2026-09-28): os 15 primeiros dias são de trabalho
  const base = {
    scaleType: 'CYCLE',
    cycleStartDate: utc(2026, 9, 28),
    workDaysInCycle: 15,
    restDaysInCycle: 2,
  };

  test('sem daysOff, o domingo dentro do ciclo é dia de trabalho', () => {
    expect(isWorkingOnDate(base, utc(2026, 10, 4))).toBe(true); // domingo, dia 7 do ciclo
  });

  test('com daysOff [0], domingo vira folga mas os outros dias seguem o ciclo', () => {
    const schedule = { ...base, daysOff: [0] };
    expect(isWorkingOnDate(schedule, utc(2026, 10, 4))).toBe(false); // domingo
    expect(isWorkingOnDate(schedule, utc(2026, 10, 5))).toBe(true); // segunda, dentro do ciclo
  });

  test('folga do ciclo continua folga', () => {
    const schedule = { ...base, daysOff: [0] };
    expect(isWorkingOnDate(schedule, utc(2026, 10, 13))).toBe(false); // dia 16 do ciclo
  });

  test('daysOff ausente (escalas antigas) não quebra', () => {
    expect(isWorkingOnDate({ ...base, daysOff: undefined }, utc(2026, 10, 5))).toBe(true);
  });
});
