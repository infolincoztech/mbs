import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const marqueeId = (session.user as any).marqueeId;
  const date = searchParams.get("date");

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        hall: { marqueeId },
        ...(date ? { eventDate: new Date(date) } : {}),
      },
      include: {
        hall: true,
        client: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { eventDate: "asc" },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { 
      hallId, 
      eventDate, 
      startTime,
      endTime,
      guestCount, 
      pricePerHead,
      totalAmount, 
      paidAmount,
      clientId,
      clientName,
      clientPhone,
      clientAddress,
      clientCnic,
      notes 
    } = await req.json();

    const date = new Date(eventDate);
    date.setHours(0, 0, 0, 0);

    // Double Booking Collision Check
    const existingBooking = await prisma.booking.findFirst({
      where: {
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

    const booking = await prisma.booking.create({
      data: {
        hallId,
        clientId: clientId || (session.user as any).id,
        clientName,
        clientPhone,
        clientAddress,
        clientCnic,
        eventDate: date,
        startTime,
        endTime,
        guestCount: parseInt(guestCount || "0"),
        pricePerHead: parseFloat(pricePerHead || "0"),
        totalAmount: parseFloat(totalAmount || "0"),
        paidAmount: parseFloat(paidAmount || "0"),
        status: "PENDING",
        notes,
      },
    });

    if (parseFloat(paidAmount || "0") > 0) {
      await prisma.financialRecord.create({
        data: {
          marqueeId: (session.user as any).marqueeId,
          type: "INCOME",
          amount: parseFloat(paidAmount),
          category: "Booking Advance",
          description: `Advance for ${clientName || "Booking"}`,
          date: new Date(),
        }
      });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("BOOKING_CREATE_ERROR", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
