const rateLimit = require('express-rate-limit');

// Limita tentativas de login/registro por IP - sem isso, nada impede
// um script de tentar milhares de senhas por minuto contra uma conta
// (ataque de força bruta). 10 tentativas a cada 15 minutos é generoso
// pro uso normal (ninguém erra a senha 10 vezes), mas inviabiliza um
// ataque automatizado.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true, // manda o limite restante nos headers RateLimit-*
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

// Teto geral pra TODA a API: não atrapalha o uso normal (o Dashboard faz
// poucas dezenas de chamadas), mas segura scripts que martelam endpoints.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Aguarde um pouco.' },
});

module.exports = { authLimiter, apiLimiter };
