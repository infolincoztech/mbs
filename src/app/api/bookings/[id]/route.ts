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
    const { id } = await params;
    const { 
      hallId, 
      eventDate, 
      startTime, 
      endTime, 
      guestCount, 
      pricePerHead, 
      totalAmount, 
      paidAmount, 
      clientName,
      clientPhone,
      clientAddress,
      clientCnic,
      notes 
    } = await req.json();

    const date = new Date(eventDate);
    date.setHours(0, 0, 0, 0);

    // Double Booking Collision Check (Excluding the current booking itself)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: { not: id },
        hallId,
        eventDate: date,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (existingBooking) {
      return NextResponse.json({ error: "This hall is already booked for this time slot on this date." }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        hallId,
        eventDate: date,
        startTime,
        endTime,
        guestCount: parseInt(guestCount || "0"),
        pricePerHead: parseFloat(pricePerHead || "0"),
        totalAmount: parseFloat(totalAmount || "0"),
        paidAmount: parseFloat(paidAmount || "0"),
        clientName,
        clientPhone,
        clientAddress,
        clientCnic,
        notes,
      },
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ message: "Booking deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
