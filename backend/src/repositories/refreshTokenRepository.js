const prisma = require('../config/prisma');

function create({ userId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
}

function findByHash(tokenHash) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

function revoke(id) {
  return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
}

// Usado no login/registro de um dispositivo novo não precisa disso,
// mas é útil pra um botão futuro de "sair de todos os dispositivos".
function revokeAllForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = { create, findByHash, revoke, revokeAllForUser };
