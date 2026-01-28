import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing database connection...\n');

  // Test 1: Count users
  const userCount = await prisma.user.count();
  console.log('✓ Users in database:', userCount);

  // Test 2: List all users
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      target: true,
    },
  });
  console.log('✓ User details:');
  users.forEach((user) => {
    console.log(`  - ${user.email} (${user.role}) - Target: ${user.target}/month`);
  });

  // Test 3: Count customers
  const customerCount = await prisma.customer.count();
  console.log('\n✓ Customers in database:', customerCount);

  // Test 4: List first 5 customers
  const customers = await prisma.customer.findMany({
    take: 5,
    select: { name: true },
  });
  console.log('✓ Sample customers:');
  customers.forEach((customer) => {
    console.log(`  - ${customer.name}`);
  });

  // Test 5: Count meetings
  const meetingCount = await prisma.meeting.count();
  console.log('\n✓ Meetings in database:', meetingCount);

  console.log('\n✅ All database tests passed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Test failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
