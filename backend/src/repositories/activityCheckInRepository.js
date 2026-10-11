const prisma = require('../config/prisma');

function findAllByUserAndDate(userId, date) {
  return prisma.activityCheckIn.findMany({ where: { userId, date } });
}

function findAllByUserInRange(userId, from, to) {
  return prisma.activityCheckIn.findMany({ where: { userId, date: { gte: from, lte: to } } });
}

function findOne(activityId, userId, date) {
  return prisma.activityCheckIn.findFirst({ where: { activityId, userId, date } });
}

function create({ activityId, userId, date }) {
  return prisma.activityCheckIn.create({ data: { activityId, userId, date } });
}

function removeByActivityAndDate(activityId, userId, date) {
  return prisma.activityCheckIn.deleteMany({ where: { activityId, userId, date } });
}

module.exports = {
  findAllByUserAndDate,
  findAllByUserInRange,
  findOne,
  create,
  removeByActivityAndDate,
};
