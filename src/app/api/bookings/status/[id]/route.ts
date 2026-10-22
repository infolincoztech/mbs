import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { status, paidAmount, guestCount, totalAmount } = await req.json();
    const { id } = await params;

    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!existingBooking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        ...(status ? { status } : {}),
        ...(paidAmount !== undefined ? { paidAmount: parseFloat(paidAmount) } : {}),
        ...(guestCount !== undefined ? { guestCount: parseInt(guestCount) } : {}),
        ...(totalAmount !== undefined ? { totalAmount: parseFloat(totalAmount) } : {}),
      },
      include: {
        client: true,
        hall: true
      }
    });

    if (status === "CONFIRMED" && existingBooking.status === "PENDING") {
      const remainingBalance = booking.totalAmount - existingBooking.paidAmount;
      if (remainingBalance > 0) {
        await prisma.financialRecord.create({
          data: {
            marqueeId: (session.user as any).marqueeId,
            type: "INCOME",
            amount: remainingBalance,
            category: "Booking Payment",
            description: `Final Payment for ${booking.clientName || booking.client?.name || "Booking"}`,
            date: new Date(),
          }
        });
      }
    }

    if (status === "CONFIRMED" || paidAmount !== undefined) {
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          title: "Payment Received",
          message: `Payment of Rs. ${paidAmount || booking.paidAmount} received for ${booking.hall.name}.`,
          type: "SUCCESS"
        }
      });
      // Also notify the admin (owner)
      const adminId = (session.user as any).id;
      if (adminId !== booking.clientId) {
        await prisma.notification.create({
          data: {
            userId: adminId,
            title: "Payment Recorded",
            message: `Payment of Rs. ${paidAmount || booking.paidAmount} recorded for ${booking.client.name}.`,
            type: "SUCCESS"
          }
        });
      }
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("BOOKING_STATUS_UPDATE_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
