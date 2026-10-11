const prisma = require('../config/prisma');

function findAllByUser(userId) {
  return prisma.flexibleGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

function findByIdAndUser(id, userId) {
  return prisma.flexibleGoal.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.flexibleGoal.create({ data });
}

function update(id, data) {
  return prisma.flexibleGoal.update({ where: { id }, data });
}

function remove(id) {
  return prisma.flexibleGoal.delete({ where: { id } });
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
