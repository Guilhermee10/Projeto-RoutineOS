const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const AppError = require('../utils/AppError');
const { parseDurationToMs } = require('../utils/duration');

// Custo do bcrypt: cada +1 dobra o tempo de hash (e o custo de um ataque
// de força bruta contra um banco vazado). 12 é um bom equilíbrio hoje.
const SALT_ROUNDS = 12;

// Hash "de mentira" comparado quando o e-mail não existe, pra o login
// demorar o mesmo tempo nos dois casos. Sem isso, a resposta mais rápida
// entregaria quais e-mails têm conta (ataque de temporização).
const DUMMY_HASH = bcrypt.hashSync('senha-que-nunca-sera-usada', SALT_ROUNDS);

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m', algorithm: 'HS256' }
  );
}

// Hash do refresh token - SHA-256 é suficiente aqui (diferente de
// senha, não precisa de bcrypt/salt): o token já nasce longo e
// aleatório, não é algo que um humano escolhe e um atacante possa
// tentar adivinhar por dicionário.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Gera o refresh token (string aleatória opaca, NÃO é um JWT) e
// salva o hash dele no banco. Guardar no banco é o que permite
// revogar antes do prazo - um JWT sozinho não teria como ser
// "desligado" antes de expirar.
async function issueRefreshToken(userId) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d'));
  await refreshTokenRepository.create({ userId, tokenHash: hashToken(rawToken), expiresAt });
  return rawToken;
}

async function issueTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id);
  return { accessToken, refreshToken };
}

// Nunca devolvemos o hash da senha pra fora do service.
function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function register({ name, email, password }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('Já existe uma conta com esse e-mail.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ name, email, hashedPassword });

  const { accessToken, refreshToken } = await issueTokenPair(user);
  return { user: sanitizeUser(user), accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    // Mensagem genérica de propósito: não revelamos se foi o
    // e-mail ou a senha que estava errada (evita enumeração de usuários).
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);
  return { user: sanitizeUser(user), accessToken, refreshToken };
}

// Troca um refresh token válido por um NOVO par de tokens - e revoga
// o refresh token antigo (rotação). Isso significa que cada refresh
// token só pode ser usado uma vez; se alguém roubar um token antigo
// e tentar reusá-lo depois do dono já ter renovado, a tentativa falha
// (sinal de possível token comprometido).
async function refreshAccessToken(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new AppError('Refresh token não fornecido.', 401);
  }

  const stored = await refreshTokenRepository.findByHash(hashToken(rawRefreshToken));
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token inválido ou expirado.', 401);
  }

  await refreshTokenRepository.revoke(stored.id);

  const user = await userRepository.findById(stored.userId);
  if (!user) {
    throw new AppError('Usuário não encontrado.', 401);
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);
  return { user: sanitizeUser(user), accessToken, refreshToken };
}

// Logout "de verdade": revoga o refresh token no banco. Se não vier
// nenhum refresh token no body, não é erro - o cliente já vai apagar
// os tokens localmente de qualquer forma.
async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const stored = await refreshTokenRepository.findByHash(hashToken(rawRefreshToken));
  if (stored && !stored.revokedAt) {
    await refreshTokenRepository.revoke(stored.id);
  }
}

module.exports = { register, login, refreshAccessToken, logout };
