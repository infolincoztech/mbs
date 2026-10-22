import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const marqueeId = (session.user as any).marqueeId;
  if (!marqueeId) return NextResponse.json({ error: "Marquee ID not found" }, { status: 400 });

  try {
    const totalBookings = await prisma.booking.count({ where: { hall: { marqueeId } } });
    const confirmedBookings = await prisma.booking.findMany({
      where: { hall: { marqueeId }, status: "CONFIRMED" },
      select: { totalAmount: true, guestCount: true, eventDate: true, hall: { select: { name: true } } }
    });

    const financialRecords = await prisma.financialRecord.findMany({
      where: { marqueeId, type: "EXPENSE" },
      select: { amount: true, date: true }
    });

    const totalBookingRevenue = (await prisma.booking.findMany({
      where: { hall: { marqueeId } },
      select: { paidAmount: true }
    })).reduce((sum, b) => sum + (b.paidAmount || 0), 0);

    const otherIncome = (await prisma.financialRecord.findMany({
      where: { marqueeId, type: "INCOME", NOT: { category: { in: ["Booking Advance", "Booking Balance", "Booking Payment"] } } },
      select: { amount: true }
    })).reduce((sum, r) => sum + (r.amount || 0), 0);

    const totalRevenue = totalBookingRevenue + otherIncome;
    const totalExpenses = financialRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
    const netRevenue = totalRevenue - totalExpenses;
    const totalGuests = confirmedBookings.reduce((sum, b) => sum + (b.guestCount || 0), 0);
    
    // Group by month
    const monthlyData: any = {};
    confirmedBookings.forEach(b => {
      const month = b.eventDate.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, bookings: 0, revenue: 0, expenses: 0 };
      }
      monthlyData[month].bookings += 1;
      monthlyData[month].revenue += b.totalAmount || 0;
    });

    financialRecords.forEach(r => {
      const month = r.date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, bookings: 0, revenue: 0, expenses: 0 };
      }
      monthlyData[month].expenses += r.amount || 0;
    });

    const chartData = Object.values(monthlyData);

    // Group by Hall for Pie Chart
    const hallCounts: Record<string, number> = {};
    confirmedBookings.forEach(b => {
      const hallName = b.hall?.name || "Unknown";
      hallCounts[hallName] = (hallCounts[hallName] || 0) + 1;
    });

    const colors = ["#2563eb", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"];
    const hallDistribution = Object.entries(hallCounts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));

    return NextResponse.json({
      stats: [
        { label: "Total Bookings", value: totalBookings.toString(), change: "+0%", positive: true },
        { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, change: "+0%", positive: true },
        { label: "Total Expenses", value: `Rs. ${totalExpenses.toLocaleString()}`, change: "+0%", positive: false },
        { label: "Net Profit", value: `Rs. ${netRevenue.toLocaleString()}`, change: "+0%", positive: netRevenue >= 0 },
      ],
      chartData: chartData.length > 0 ? chartData : [
        { name: "Jan", bookings: 0, revenue: 0, expenses: 0 },
        { name: "Feb", bookings: 0, revenue: 0, expenses: 0 },
      ],
      hallDistribution
    });
  } catch (error) {
    console.error("ANALYTICS_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
