import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { hallId } = await req.json();

    // Logic: Find the next 3 available weekend slots for the given hall
    const suggestions = [];
    let checkDate = new Date();
    
    while (suggestions.length < 3) {
      checkDate.setDate(checkDate.getDate() + 1);
      const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;
      
      if (isWeekend) {
        const existing = await prisma.booking.findFirst({
          where: {
            hallId,
            eventDate: {
              gte: new Date(checkDate.setHours(0,0,0,0)),
              lt: new Date(checkDate.setHours(23,59,59,999)),
            },
            status: { not: "CANCELLED" }
          }
        });

        if (!existing) {
          suggestions.push({
            date: new Date(checkDate),
            slot: "Evening",
            reason: "Popular Weekend Slot (High Demand)"
          });
        }
      }

      // Don't search too far
      if (checkDate.getTime() > Date.now() + 90 * 24 * 60 * 60 * 1000) break;
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: "AI logic failed" }, { status: 500 });
  }
}
