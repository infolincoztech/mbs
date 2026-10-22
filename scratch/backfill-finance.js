const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const marqueeId = "cm63p6p0q0001sz94g0t4g0t4"; // I should fetch this or do it for all
    // Let's do it for all Marquees
    const marquees = await prisma.marquee.findMany();
    
    for (const marquee of marquees) {
      console.log(`Processing Marquee: ${marquee.name}`);
      
      const bookings = await prisma.booking.findMany({
        where: { hall: { marqueeId: marquee.id } }
      });
      
      for (const booking of bookings) {
        // 1. Check for Advance Payment
        if (booking.paidAmount > 0) {
          const existing = await prisma.financialRecord.findFirst({
            where: {
              marqueeId: marquee.id,
              type: "INCOME",
              amount: booking.paidAmount,
              description: { contains: booking.clientName || "Booking" }
            }
          });
          
          if (!existing) {
            console.log(`Backfilling payment for ${booking.clientName}: Rs. ${booking.paidAmount}`);
            await prisma.financialRecord.create({
              data: {
                marqueeId: marquee.id,
                type: "INCOME",
                amount: booking.paidAmount,
                category: "Booking Payment",
                description: `Payment for ${booking.clientName || "Booking"} (${booking.status})`,
                date: booking.createdAt
              }
            });
          }
        }
      }
    }
    console.log("Backfill complete!");
  } catch (error) {
    console.error("Backfill error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
