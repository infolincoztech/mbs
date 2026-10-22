import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const marqueeId = (session.user as any).marqueeId;

  try {
    // 1. Auto-generate notifications for today's bookings if they don't exist
    if (marqueeId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayBookings = await prisma.booking.findMany({
        where: {
          hall: { marqueeId },
          eventDate: {
            gte: today,
            lt: tomorrow
          }
        },
        include: { hall: true }
      });

      for (const booking of todayBookings) {
        const title = `Today's Booking: ${booking.clientName || "Event"}`;
        const message = `Booking at ${booking.hall.name} from ${booking.startTime} to ${booking.endTime}.`;
        
        // Check if already notified today for this specific booking
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            title,
            createdAt: { gte: today }
          }
        });

        if (!existing) {
          await prisma.notification.create({
            data: {
              userId,
              title,
              message,
              type: "INFO"
            }
          });
        }
      }
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("NOTIFICATION_GET_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, action } = await req.json();

    if (action === "read") {
      await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.notification.delete({
        where: { id }
      });
    } else {
      // Clear all notifications for this user
      await prisma.notification.deleteMany({
        where: { userId: (session.user as any).id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
