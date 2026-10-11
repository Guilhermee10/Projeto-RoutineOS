const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token não fornecido.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    // Anexamos o usuário decodificado na requisição - qualquer rota
    // protegida a partir daqui pode acessar req.userId
    req.userId = payload.sub;
    next();
  } catch (error) {
    return next(new AppError('Token inválido ou expirado.', 401));
  }
}

module.exports = authMiddleware;
