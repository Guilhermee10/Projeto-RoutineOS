const prisma = require('../config/prisma');

function findAllByUser(userId, { from, to } = {}) {
  return prisma.sleepRecord.findMany({
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
  return prisma.sleepRecord.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.sleepRecord.create({ data });
}

function update(id, data) {
  return prisma.sleepRecord.update({ where: { id }, data });
}

function remove(id) {
  return prisma.sleepRecord.delete({ where: { id } });
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
