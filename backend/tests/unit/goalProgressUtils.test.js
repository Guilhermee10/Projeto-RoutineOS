const { filterSinceReset } = require('../../src/utils/goalProgressUtils');

describe('filterSinceReset', () => {
  const records = [
    { id: 'old', createdAt: new Date('2026-10-10T10:00:00Z') },
    { id: 'new', createdAt: new Date('2026-10-10T20:00:00Z') },
  ];

  it('sem reset devolve tudo', () => {
    expect(filterSinceReset(records, null)).toHaveLength(2);
  });

  it('com reset ignora o que foi criado antes', () => {
    const result = filterSinceReset(records, new Date('2026-10-10T15:00:00Z'));
    expect(result.map((r) => r.id)).toEqual(['new']);
  });

  it('registro criado exatamente no instante do reset conta', () => {
    const result = filterSinceReset(records, new Date('2026-10-10T20:00:00Z'));
    expect(result.map((r) => r.id)).toEqual(['new']);
  });
});
