const { pickFields } = require('../../src/utils/pickFields');

const ACTIVITY_FIELDS = [
  'name', 'category', 'description', 'startTime', 'endTime',
  'daysOfWeek', 'priority', 'location', 'notes', 'commuteMinutes',
];

describe('pickFields', () => {
  test('descarta campos fora da lista (regressão: payload real do erro de edição de atividade)', () => {
    // Exatamente o que o frontend mandava ao editar uma atividade: o
    // objeto inteiro recebido da API, com id/datas/userId e o
    // durationMinutes (calculado, não é coluna) misturados.
    const body = {
      name: 'jiu-jitsu 2',
      category: 'OUTROS',
      startTime: '10:00',
      endTime: '12:00',
      daysOfWeek: [3],
      priority: 'MEDIA',
      location: '',
      notes: '',
      commuteMinutes: 20,
      id: '0278470f-c606-4a46-8d0e-6ff5415c9c82',
      description: null,
      createdAt: '2026-10-04T02:29:55.213Z',
      updatedAt: '2026-10-04T02:29:55.213Z',
      userId: '6f5528b9-5796-471e-bbf6-b4f77e0e9f41',
      durationMinutes: 120,
    };

    const result = pickFields(body, ACTIVITY_FIELDS);

    expect(Object.keys(result).sort()).toEqual([...ACTIVITY_FIELDS].sort());
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('userId');
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('updatedAt');
    expect(result).not.toHaveProperty('durationMinutes');
  });

  test('mantém valores "falsy" legítimos: null, 0, false e string vazia', () => {
    const result = pickFields(
      { a: null, b: 0, c: false, d: '' },
      ['a', 'b', 'c', 'd']
    );
    expect(result).toEqual({ a: null, b: 0, c: false, d: '' });
  });

  test('ignora campos permitidos que não vieram (undefined) - importante pra update parcial', () => {
    const result = pickFields({ name: 'Novo nome' }, ACTIVITY_FIELDS);
    expect(result).toEqual({ name: 'Novo nome' });
  });

  test('não altera o objeto original', () => {
    const body = { name: 'x', id: '1' };
    pickFields(body, ['name']);
    expect(body).toEqual({ name: 'x', id: '1' });
  });

  test('campos como "user" e "checkIns" (relações do Prisma) também são descartados', () => {
    const result = pickFields({ name: 'x', user: { id: '1' }, checkIns: [] }, ['name']);
    expect(result).toEqual({ name: 'x' });
  });
});
