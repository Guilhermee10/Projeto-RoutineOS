const prisma = require('../config/prisma');

// Fixadas primeiro, depois as editadas mais recentemente.
const ORDER = [{ pinned: 'desc' }, { updatedAt: 'desc' }];

function findAll(where, { limit } = {}) {
  return prisma.note.findMany({ where, orderBy: ORDER, ...(limit ? { take: limit } : {}) });
}

function findByIdAndUser(id, userId) {
  return prisma.note.findFirst({ where: { id, userId } });
}

function create(data) {
  return prisma.note.create({ data });
}

function update(id, data) {
  return prisma.note.update({ where: { id }, data });
}

function remove(id) {
  return prisma.note.delete({ where: { id } });
}

async function findDistinctTags(userId) {
  const notes = await prisma.note.findMany({ where: { userId, archived: false }, select: { tags: true } });
  return notes.flatMap((n) => n.tags);
}

module.exports = { findAll, findByIdAndUser, create, update, remove, findDistinctTags };
