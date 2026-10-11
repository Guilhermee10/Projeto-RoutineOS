const prisma = require('../config/prisma');

function findAllByUserAndDate(userId, date) {
  return prisma.goalCheckIn.findMany({ where: { userId, date } });
}

function findOne(goalId, userId, date) {
  return prisma.goalCheckIn.findFirst({ where: { goalId, userId, date } });
}

function create({ goalId, userId, date }) {
  return prisma.goalCheckIn.create({ data: { goalId, userId, date } });
}

function removeByGoalAndDate(goalId, userId, date) {
  return prisma.goalCheckIn.deleteMany({ where: { goalId, userId, date } });
}

module.exports = { findAllByUserAndDate, findOne, create, removeByGoalAndDate };
