const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const booking = await prisma.booking.create({
      data: {
        hallId: "cm6u2q5er0003y4aou7kpsa64", // dummy or fetch one
        clientId: "cm6u2q5em0000y4aok2s746ce", // dummy
        clientName: "Test",
        clientPhone: "123",
        clientAddress: "Test",
        clientCnic: "123",
        eventDate: new Date(),
        startTime: "12:00",
        endTime: "14:00",
        guestCount: 100,
        pricePerHead: 100,
        totalAmount: 10000,
        paidAmount: 0,
        status: "PENDING",
      }
    });
    console.log("Success", booking);
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Just fetch a valid hallId first
async function run() {
  try {
    const hall = await prisma.hall.findFirst();
    if (!hall) return console.log("No hall found");
    const user = await prisma.user.findFirst();
    
    await prisma.booking.create({
      data: {
        hallId: hall.id,
        clientId: user.id,
        clientName: "Test",
        clientPhone: "123",
        clientAddress: "Test",
        clientCnic: "123",
        eventDate: new Date(),
        startTime: "12:00",
        endTime: "14:00",
        guestCount: 100,
        pricePerHead: 100,
        totalAmount: 10000,
        paidAmount: 0,
        status: "PENDING",
      }
    });
    console.log("Success");
  } catch(e) {
    console.error(e);
  }
}
run();
