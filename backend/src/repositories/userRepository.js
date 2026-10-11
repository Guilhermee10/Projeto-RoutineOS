const prisma = require('../config/prisma');

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

function create({ name, email, hashedPassword }) {
  return prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
}

module.exports = { findByEmail, findById, create };
