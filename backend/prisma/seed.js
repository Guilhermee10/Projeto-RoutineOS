const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'teste@routineos.dev' },
    update: {},
    create: {
      name: 'Usuário de Teste',
      email: 'teste@routineos.dev',
      // senha de exemplo em texto puro só porque ainda não implementamos
      // o hash com bcrypt (isso entra no Sprint 3 - Autenticação)
      password: 'senha_temporaria_sera_hasheada_no_sprint_3',
    },
  });

  console.log('Seed concluído:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
