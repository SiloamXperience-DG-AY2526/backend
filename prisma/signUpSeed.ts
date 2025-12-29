import { prisma } from '../src/prisma/client';

async function main() {
  const roles = [
    { roleName: 'superAdmin', description: 'Super administrator' },
    { roleName: 'generalManager', description: 'General manager' },
    { roleName: 'financeManager', description: 'Finance manager' },
    { roleName: 'partner', description: 'Partner user' },
  ];

  for (const r of roles) {
    const existing = await prisma.role.findFirst({ where: { roleName: r.roleName } });
    if (existing) {
      await prisma.role.update({ where: { id: existing.id }, data: { description: r.description } });
      console.log(`Updated role: ${r.roleName}`);
    } else {
      await prisma.role.create({ data: r });
      console.log(`Created role: ${r.roleName}`);
    }
  }

  console.log('Role seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
