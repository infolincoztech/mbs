import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const marquees = await prisma.marquee.findMany();
    let count = 0;
    
    for (const marquee of marquees) {
      const bookings = await prisma.booking.findMany({
        where: { hall: { marqueeId: marquee.id } }
      });
      
      for (const booking of bookings) {
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
            count++;
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, backfilled: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
