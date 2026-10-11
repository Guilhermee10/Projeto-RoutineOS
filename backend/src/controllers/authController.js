const authService = require('../services/authService');
const { validateRegisterInput, validateLoginInput } = require('../utils/validators');

// Nota: cada função aqui é "burra" de propósito - ela só valida a
// entrada, chama o service e devolve a resposta HTTP. Qualquer decisão
// de negócio (senha errada? e-mail duplicado?) mora no service.

async function register(req, res, next) {
  try {
    validateRegisterInput(req.body);
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    validateLoginInput(req.body);
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// Troca um refresh token válido por um access token novo (e um
// refresh token novo também, por rotação - ver authService).
async function refresh(req, res, next) {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// Agora com refresh tokens no banco, o logout é de verdade: revoga o
// refresh token, então ele não pode mais ser trocado por um access
// token novo. O access token em si continua válido até expirar (é
// curto, 15min por padrão), mas sem o refresh a sessão não se renova.
async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(200).json({ message: 'Logout realizado.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, refresh, logout };
