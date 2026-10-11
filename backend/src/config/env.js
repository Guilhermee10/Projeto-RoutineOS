// Valida as variáveis de ambiente ANTES de o servidor subir. Falhar na
// partida, com uma mensagem clara, é bem melhor do que subir "meio
// quebrado" e só descobrir no primeiro login (ex: JWT_SECRET ausente
// gera tokens inválidos; DATABASE_URL ausente estoura no Prisma).

const MIN_SECRET_LENGTH = 32;
const WEAK_SECRETS = ['changeme', 'secret', 'password', '123456'];

function validateEnv(env = process.env) {
  const problems = [];
  const isProduction = env.NODE_ENV === 'production';

  if (!env.DATABASE_URL) {
    problems.push('DATABASE_URL não definida (crie o arquivo backend/.env a partir do .env.example).');
  }

  const secret = env.JWT_SECRET || '';
  if (!secret) {
    problems.push('JWT_SECRET não definida.');
  } else if (isProduction) {
    const looksWeak = WEAK_SECRETS.some((weak) => secret.toLowerCase().includes(weak));
    if (secret.length < MIN_SECRET_LENGTH || looksWeak) {
      problems.push(
        `JWT_SECRET fraca para produção: use um valor aleatório de pelo menos ${MIN_SECRET_LENGTH} caracteres ` +
          '(gere com: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))").'
      );
    }
  }

  if (isProduction && !env.CORS_ORIGIN) {
    problems.push('CORS_ORIGIN não definida (em produção informe o endereço do frontend).');
  }

  return problems;
}

function assertEnv(env = process.env) {
  const problems = validateEnv(env);
  if (problems.length > 0) {
    console.error('Configuração inválida:\n - ' + problems.join('\n - '));
    process.exit(1);
  }
}

module.exports = { validateEnv, assertEnv };
