const prisma = require('../config/prisma');

function findAllByUser(userId) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { startTime: 'asc' },
  });
}

function findByIdAndUser(id, userId) {
  return prisma.activity.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.activity.create({ data });
}

function update(id, data) {
  return prisma.activity.update({ where: { id }, data });
}

function remove(id) {
  return prisma.activity.delete({ where: { id } });
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
