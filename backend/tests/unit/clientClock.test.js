const { parseClientDate, parseClientTime } = require('../../src/middlewares/clientClock');
const clientClock = require('../../src/middlewares/clientClock');
const { getToday } = require('../../src/utils/dateUtils');
const { getClientTime } = require('../../src/utils/requestContext');

const fakeReq = (headers) => ({ get: (name) => headers[name.toLowerCase()] });

describe('clientClock', () => {
  test('aceita data e hora válidas', () => {
    expect(parseClientDate('2026-10-12')).toBe('2026-10-12');
    expect(parseClientTime('22:30')).toBe('22:30');
  });

  test('rejeita formatos inválidos e datas impossíveis', () => {
    expect(parseClientDate('2026-02-31')).toBeNull();
    expect(parseClientDate('12/10/2026')).toBeNull();
    expect(parseClientDate(undefined)).toBeNull();
    expect(parseClientDate('2026-10-12; DROP TABLE')).toBeNull();
    expect(parseClientTime('24:00')).toBeNull();
    expect(parseClientTime('9:5')).toBeNull();
  });

  test('getToday usa a data do cliente durante a requisição', (done) => {
    clientClock(fakeReq({ 'x-client-date': '2030-01-15', 'x-client-time': '23:10' }), {}, () => {
      expect(getToday().toISOString().slice(0, 10)).toBe('2030-01-15');
      expect(getClientTime()).toBe('23:10');
      done();
    });
  });

  test('sem headers (ou inválidos) cai no relógio do servidor', (done) => {
    clientClock(fakeReq({ 'x-client-date': 'lixo' }), {}, () => {
      const now = new Date();
      const expected = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      expect(getToday().getTime()).toBe(expected.getTime());
      expect(getClientTime()).toBeNull();
      done();
    });
  });

  test('o contexto não vaza para fora da requisição', () => {
    expect(getClientTime()).toBeNull();
  });
});
