import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const monthStr = searchParams.get("month");
  const yearStr = searchParams.get("year");
  
  const marqueeId = (session.user as any).marqueeId;

  try {
    let whereClause: any = { marqueeId };

    if (monthStr && yearStr) {
      const month = parseInt(monthStr);
      const year = parseInt(yearStr);
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const records = await prisma.financialRecord.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    // Also fetch bookings for the same period if date filter is active
    let bookingIncome = 0;
    if (whereClause.date) {
      const bookings = await prisma.booking.findMany({
        where: {
          hall: { marqueeId },
          createdAt: whereClause.date // Using createdAt as the transaction date
        }
      });
      bookingIncome = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    } else {
      const bookings = await prisma.booking.findMany({
        where: { hall: { marqueeId } }
      });
      bookingIncome = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    }

    const otherIncome = records
      .filter((r: any) => r.type === "INCOME" && r.category !== "Booking Advance" && r.category !== "Booking Balance" && r.category !== "Booking Payment")
      .reduce((sum: number, r: any) => sum + r.amount, 0);

    const income = bookingIncome + otherIncome;

    const expenses = records
      .filter((r: any) => r.type === "EXPENSE")
      .reduce((sum: number, r: any) => sum + r.amount, 0);

    return NextResponse.json({
      records,
      summary: {
        totalIncome: income,
        totalExpense: expenses,
        netProfit: income - expenses,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { type, amount, category, description, date } = await req.json();
    const marqueeId = (session.user as any).marqueeId;

    const record = await prisma.financialRecord.create({
      data: {
        marqueeId,
        type, // INCOME or EXPENSE
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
