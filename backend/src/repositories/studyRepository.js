const prisma = require('../config/prisma');

function findAllByUser(userId, { from, to } = {}) {
  return prisma.studySession.findMany({
    where: {
      userId,
      ...(from || to
        ? { date: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
    },
    orderBy: { date: 'desc' },
  });
}

function findByIdAndUser(id, userId) {
  return prisma.studySession.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.studySession.create({ data });
}

function update(id, data) {
  return prisma.studySession.update({ where: { id }, data });
}

function remove(id) {
  return prisma.studySession.delete({ where: { id } });
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
