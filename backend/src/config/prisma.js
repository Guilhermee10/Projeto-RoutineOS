const { PrismaClient } = require('@prisma/client');

// Padrão "singleton": criamos UMA instância do client e reaproveitamos
// em toda a aplicação, em vez de instanciar um novo client a cada
// arquivo que precisa falar com o banco. Isso evita esgotar o pool
// de conexões do Postgres.
const prisma = new PrismaClient();

module.exports = prisma;
