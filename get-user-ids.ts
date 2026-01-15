import { prisma } from './src/prisma/client';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (users.length === 0) {
    console.log('❌ No users found in database. Run seed script first: npm run seed');
    return;
  }

  console.log('\n📋 User UUIDs:');
  console.log('='.repeat(70));
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   UUID: ${user.id}`);
    console.log('');
  });
  console.log('='.repeat(70));
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
