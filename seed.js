/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      id: '1',
      email: 'student@demo.com',
      name: 'Demo Student',
    },
  });

  await prisma.progress.createMany({
    data: [
      { userId: user.id, topic: "Newton's Laws", score: 65, weakAreas: '[]', strongAreas: '[]' },
      { userId: user.id, topic: 'Thermodynamics', score: 70, weakAreas: '[]', strongAreas: '[]' },
      {
        userId: user.id,
        topic: 'Quantum Mechanics',
        score: 85,
        weakAreas: '[]',
        strongAreas: '[]',
      },
      { userId: user.id, topic: 'Relativity', score: 78, weakAreas: '[]', strongAreas: '[]' },
      { userId: user.id, topic: 'String Theory', score: 92, weakAreas: '[]', strongAreas: '[]' },
    ],
  });

  console.log('Database seeded with demo progress!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
