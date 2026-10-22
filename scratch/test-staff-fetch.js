const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        payrolls: true,
        advances: true
      }
    });
    console.log("Staff count:", staff.length);
    console.log("First staff advances:", staff[0]?.advances);
  } catch (error) {
    console.error("Error fetching staff:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
