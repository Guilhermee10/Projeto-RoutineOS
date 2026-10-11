const scheduledSlotRepository = require('../repositories/scheduledSlotRepository');
const AppError = require('../utils/AppError');

function listByUser(userId, filters) {
  return scheduledSlotRepository.findAllByUser(userId, filters);
}

async function confirm(userId, id) {
  const existing = await scheduledSlotRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Sugestão não encontrada.', 404);
  return scheduledSlotRepository.updateStatus(id, 'CONFIRMED');
}

// "Rejeitar" uma sugestão é simplesmente removê-la - ela nunca chegou
// a ser uma atividade de verdade, só uma proposta do motor.
async function reject(userId, id) {
  const existing = await scheduledSlotRepository.findByIdAndUser(id, userId);
  if (!existing) throw new AppError('Sugestão não encontrada.', 404);
  await scheduledSlotRepository.remove(id);
}

module.exports = { listByUser, confirm, reject };
