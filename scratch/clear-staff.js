const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.staff.deleteMany();
  console.log('Staff deleted');
}
main().finally(() => prisma.$disconnect());
