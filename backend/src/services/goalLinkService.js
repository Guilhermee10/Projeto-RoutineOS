const goalRepository = require('../repositories/goalRepository');
const AppError = require('../utils/AppError');

// Usado por estudos e treinos: valida a meta escolhida pelo usuário ao
// registrar uma sessão. goalId vazio/null = a sessão não conta pra meta
// nenhuma. A meta precisa ser do próprio usuário e do tipo certo.
async function resolveLinkedGoalId(userId, goalId, expectedType, typeLabel) {
  if (!goalId) return null;
  const goal = await goalRepository.findByIdAndUser(goalId, userId);
  if (!goal) throw new AppError('Meta não encontrada.', 404);
  if (goal.type !== expectedType) {
    throw new AppError(`Só é possível vincular a uma meta de ${typeLabel}.`, 422);
  }
  return goal.id;
}

module.exports = { resolveLinkedGoalId };
