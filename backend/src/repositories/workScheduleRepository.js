const prisma = require('../config/prisma');

function findAllByUser(userId) {
  return prisma.workSchedule.findMany({ where: { userId } });
}

function findByIdAndUser(id, userId) {
  return prisma.workSchedule.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.workSchedule.create({ data });
}

function update(id, data) {
  return prisma.workSchedule.update({ where: { id }, data });
}

function remove(id) {
  return prisma.workSchedule.delete({ where: { id } });
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
