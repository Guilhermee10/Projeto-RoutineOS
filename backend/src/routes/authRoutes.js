const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const userRepository = require('../repositories/userRepository');

const router = express.Router();

// O rate limiter só entra nas rotas sensíveis a força bruta - não faz
// sentido limitar /me ou /refresh da mesma forma.
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Rota protegida de exemplo: só acessível com um token válido.
// Serve pra confirmarmos que o authMiddleware está funcionando.
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.userId);
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
