// Middleware de erro do Express precisa ter exatamente 4 parâmetros
// (err, req, res, next) - é assim que o Express reconhece que essa
// função trata erros, e não uma rota normal.
function errorMiddleware(err, req, res, next) {
  const isOperational = err.isOperational === true;
  const statusCode = err.statusCode || 500;

  if (!isOperational) {
    // Erro inesperado (bug, falha de conexão, etc): logamos o
    // stack completo no servidor, mas NUNCA mandamos esse detalhe
    // pro cliente - poderia vazar informação sensível da infra.
    console.error('Erro inesperado:', err);
  }

  res.status(statusCode).json({
    error: isOperational ? err.message : 'Erro interno do servidor.',
  });
}

module.exports = errorMiddleware;
