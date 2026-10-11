const { parseDurationToMs } = require('../../src/utils/duration');

describe('parseDurationToMs', () => {
  test('converte segundos, minutos, horas e dias corretamente', () => {
    expect(parseDurationToMs('30s')).toBe(30_000);
    expect(parseDurationToMs('15m')).toBe(900_000);
    expect(parseDurationToMs('1h')).toBe(3_600_000);
    expect(parseDurationToMs('7d')).toBe(604_800_000);
  });

  test('aceita espaços em volta do valor', () => {
    expect(parseDurationToMs(' 7d ')).toBe(604_800_000);
  });

  test('lança erro em formato inválido', () => {
    expect(() => parseDurationToMs('abc')).toThrow(/Formato de duração inválido/);
    expect(() => parseDurationToMs('10')).toThrow();
    expect(() => parseDurationToMs('10x')).toThrow();
  });
});
