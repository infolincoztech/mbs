import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const marqueeId = (session.user as any).marqueeId;
  const role = (session.user as any).role;

  if (role !== "MARQUEE_ADMIN" && role !== "SUPER_ADMIN" && role !== "STAFF") {
    return NextResponse.json({ message: "No notifications to generate" });
  }

  try {
    // Find bookings happening within the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        hall: { marqueeId },
        eventDate: {
          gte: new Date(),
          lte: threeDaysFromNow,
        },
        status: "CONFIRMED"
      },
      include: {
        client: true,
        hall: true
      }
    });

    for (const booking of upcomingBookings) {
      const eventDateStr = booking.eventDate.toLocaleDateString();
      const message = `Upcoming booking for ${booking.client.name} in ${booking.hall.name} on ${eventDateStr}.`;
      
      // Check if this specific notification already exists for this user
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          message
        }
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            title: "Upcoming Event",
            message,
            type: "INFO"
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GENERATE_NOTIFICATIONS_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
