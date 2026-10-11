// Erro "operacional": um erro esperado do domínio da aplicação
// (ex: "e-mail já cadastrado"), diferente de um bug inesperado.
// Isso permite ao middleware de erro decidir: erro conhecido ->
// manda a mensagem certa pro usuário; erro desconhecido -> loga
// e manda uma mensagem genérica (nunca vazamos detalhes internos).
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = AppError;
