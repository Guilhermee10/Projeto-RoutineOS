const { calculateAverage, calculateMin, calculateMax } = require('../../src/utils/statsUtils');

describe('statsUtils', () => {
  test('média de uma lista', () => {
    expect(calculateAverage([440, 400, 430, 480, 390])).toBe(428);
  });

  test('mínimo e máximo', () => {
    expect(calculateMin([440, 400, 480])).toBe(400);
    expect(calculateMax([440, 400, 480])).toBe(480);
  });

  test('listas vazias devolvem zero em vez de NaN/Infinity', () => {
    expect(calculateAverage([])).toBe(0);
    expect(calculateMin([])).toBe(0);
    expect(calculateMax([])).toBe(0);
  });
});
