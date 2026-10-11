const { normalizeTags, buildNoteWhere, MAX_TAGS } = require('../../src/utils/noteUtils');

describe('normalizeTags', () => {
  test('minúsculas, sem espaços e sem repetição', () => {
    expect(normalizeTags(['AWS', ' aws ', 'Inglês', ''])).toEqual(['aws', 'inglês']);
  });

  test('ignora o que não é texto e entrada que não é lista', () => {
    expect(normalizeTags(['a', 1, null, {}])).toEqual(['a']);
    expect(normalizeTags('aws')).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
  });

  test('limita a quantidade de tags', () => {
    const many = Array.from({ length: 25 }, (_, i) => `t${i}`);
    expect(normalizeTags(many)).toHaveLength(MAX_TAGS);
  });
});

describe('buildNoteWhere', () => {
  test('sempre filtra pelo usuário e por não arquivadas por padrão', () => {
    expect(buildNoteWhere('u1')).toEqual({ userId: 'u1', archived: false });
  });

  test('archived true lista só as arquivadas', () => {
    expect(buildNoteWhere('u1', { archived: true }).archived).toBe(true);
  });

  test('tag vira filtro "has" normalizado', () => {
    expect(buildNoteWhere('u1', { tag: ' AWS ' }).tags).toEqual({ has: 'aws' });
  });

  test('busca procura no título e no conteúdo, sem diferenciar maiúsculas', () => {
    const where = buildNoteWhere('u1', { q: '  sql ' });
    expect(where.OR).toEqual([
      { title: { contains: 'sql', mode: 'insensitive' } },
      { content: { contains: 'sql', mode: 'insensitive' } },
    ]);
  });

  test('busca vazia não cria filtro', () => {
    expect(buildNoteWhere('u1', { q: '   ' }).OR).toBeUndefined();
  });

  test('filtra por meta', () => {
    expect(buildNoteWhere('u1', { goalId: 'g1' }).goalId).toBe('g1');
  });
});
