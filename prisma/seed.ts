import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ey.com' },
    update: {},
    create: {
      email: 'admin@ey.com',
      name: 'Admin User',
      role: 'ADMIN',
      target: 10,
    },
  });

  const customers = [
    'Microsoft',
    'Google',
    'Amazon',
    'Apple',
    'Meta',
    'IBM',
    'Oracle',
    'SAP',
    'Salesforce',
    'Adobe',
  ];

  for (const name of customers) {
    await prisma.customer.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeded admin user:', admin.email);
  console.log('Seeded', customers.length, 'customers');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
