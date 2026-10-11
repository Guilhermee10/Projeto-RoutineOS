const prisma = require('../config/prisma');

function findAllByUser(userId, { from, to } = {}) {
  return prisma.workout.findMany({
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
  return prisma.workout.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.workout.create({ data });
}

function update(id, data) {
  return prisma.workout.update({ where: { id }, data });
}

function remove(id) {
  return prisma.workout.delete({ where: { id } });
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
