const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function cleanup() {
  try {
    // Delete in order of dependency
    console.log("Cleaning up Bookings...");
    await prisma.booking.deleteMany({});
    
    console.log("Cleaning up Financial Records...");
    await prisma.financialRecord.deleteMany({});
    
    console.log("Cleaning up Staff...");
    await prisma.staff.deleteMany({});
    
    console.log("Cleaning up Packages...");
    await prisma.package.deleteMany({});

    console.log("Database cleanup successful!");
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
