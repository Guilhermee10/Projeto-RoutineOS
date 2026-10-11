const prisma = require('../config/prisma');

function findAllByUser(userId, { status, from, to } = {}) {
  return prisma.scheduledSlot.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(from || to
        ? { date: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
    },
    include: { flexibleGoal: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

function findByIdAndUser(id, userId) {
  return prisma.scheduledSlot.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.scheduledSlot.create({ data });
}

function updateStatus(id, status) {
  return prisma.scheduledSlot.update({ where: { id }, data: { status } });
}

function remove(id) {
  return prisma.scheduledSlot.delete({ where: { id } });
}

// Apaga as sugestões antigas (não confirmadas) de uma semana antes de
// gerar novas - permite rodar a análise de novo sem duplicar sugestão.
function deleteSuggestedInRange(userId, from, to) {
  return prisma.scheduledSlot.deleteMany({
    where: { userId, status: 'SUGGESTED', date: { gte: from, lte: to } },
  });
}

module.exports = {
  findAllByUser,
  findByIdAndUser,
  create,
  updateStatus,
  remove,
  deleteSuggestedInRange,
};
