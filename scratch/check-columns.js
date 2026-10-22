const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  try {
    const booking = await prisma.booking.findFirst();
    console.log("Found booking keys:", booking ? Object.keys(booking) : "No bookings");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
