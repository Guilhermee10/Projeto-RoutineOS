const { validateEnv } = require('../../src/config/env');

const GOOD = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_SECRET: 'a'.repeat(10) + 'Xq9' + 'b'.repeat(25),
};

describe('validateEnv', () => {
  test('desenvolvimento aceita configuração mínima', () => {
    expect(validateEnv({ ...GOOD, NODE_ENV: 'development' })).toEqual([]);
  });

  test('exige DATABASE_URL e JWT_SECRET', () => {
    const problems = validateEnv({});
    expect(problems).toHaveLength(2);
  });

  test('produção recusa JWT_SECRET curta ou óbvia', () => {
    expect(validateEnv({ ...GOOD, NODE_ENV: 'production', JWT_SECRET: 'curta', CORS_ORIGIN: 'https://x.com' })).toHaveLength(1);
    expect(
      validateEnv({ ...GOOD, NODE_ENV: 'production', JWT_SECRET: 'changeme_' + 'x'.repeat(40), CORS_ORIGIN: 'https://x.com' })
    ).toHaveLength(1);
  });

  test('produção exige CORS_ORIGIN', () => {
    expect(validateEnv({ ...GOOD, NODE_ENV: 'production' })).toHaveLength(1);
  });

  test('produção com tudo certo passa', () => {
    expect(validateEnv({ ...GOOD, NODE_ENV: 'production', CORS_ORIGIN: 'https://app.exemplo.com' })).toEqual([]);
  });
});
