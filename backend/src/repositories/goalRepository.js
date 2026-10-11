const prisma = require('../config/prisma');

function findAllByUser(userId) {
  return prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

function findByIdAndUser(id, userId) {
  return prisma.goal.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.goal.create({ data });
}

function update(id, data) {
  return prisma.goal.update({ where: { id }, data });
}

function remove(id) {
  return prisma.goal.delete({ where: { id } });
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
