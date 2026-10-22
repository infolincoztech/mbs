import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const marqueeId = (session.user as any).marqueeId;

  try {
    if (role === "SUPER_ADMIN") {
      const totalMarquees = await prisma.marquee.count();
      const totalUsers = await prisma.user.count();
      const activeSubscriptions = await prisma.subscription.count({ where: { status: "ACTIVE" } });
      const subscriptions = await prisma.subscription.findMany({
        where: { status: { not: "TRIAL" } }
      });
      
      let superAdminRevenue = 0;
      subscriptions.forEach(sub => {
        if (sub.planType === "MONTHLY") superAdminRevenue += 3000;
        else if (sub.planType === "HALF_YEARLY") superAdminRevenue += 10000;
        else if (sub.planType === "YEARLY") superAdminRevenue += 20000;
        else if (sub.planType === "LIFETIME") superAdminRevenue += 100000;
      });

      return NextResponse.json({
        stats: [
          { label: "Total Marquees", value: totalMarquees.toString(), trend: "+5%" },
          { label: "Active Subscriptions", value: activeSubscriptions.toString(), trend: "+2%" },
          { label: "Total Revenue", value: `Rs. ${superAdminRevenue.toLocaleString()}`, trend: "From Subscriptions" },
          { label: "Total Users", value: totalUsers.toString(), trend: "+8%" },
        ]
      });
    }

    if (role === "MARQUEE_ADMIN") {
      const totalBookings = await prisma.booking.count({ where: { hall: { marqueeId } } });
      const records = await prisma.financialRecord.findMany({ where: { marqueeId } });
      const bookings = await prisma.booking.findMany({ 
        where: { hall: { marqueeId } },
        select: { paidAmount: true }
      });
      
      const totalBookingRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
      
      const otherIncome = records
        .filter(r => r.type === "INCOME" && r.category !== "Booking Advance" && r.category !== "Booking Balance" && r.category !== "Booking Payment")
        .reduce((sum, r) => sum + r.amount, 0);

      const totalRevenue = totalBookingRevenue + otherIncome;

      const totalExpense = records
        .filter(r => r.type === "EXPENSE")
        .reduce((sum, r) => sum + r.amount, 0);
      const netProfit = totalRevenue - totalExpense;

      const recentBookings = await prisma.booking.findMany({
        where: { hall: { marqueeId } },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { client: { select: { name: true } }, hall: { select: { name: true } } }
      });

      const last7DaysBookings = await prisma.booking.findMany({
        where: { 
          hall: { marqueeId }, 
          status: "CONFIRMED",
          eventDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: { totalAmount: true, eventDate: true }
      });

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const chartData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = days[date.getDay()];
        const total = last7DaysBookings
          .filter(b => b.eventDate.toDateString() === date.toDateString())
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        return { name: dayName, total };
      });

      return NextResponse.json({
        stats: [
          { label: "Total Bookings", value: totalBookings.toString(), trend: "Live" },
          { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, trend: "+12%" },
          { label: "Total Expenses", value: `Rs. ${totalExpense.toLocaleString()}`, trend: "Monthly" },
          { label: "Net Profit", value: `Rs. ${netProfit.toLocaleString()}`, trend: "Growth" },
        ],
        chartData
      });
    }

    // Default for Client
    const myBookings = await prisma.booking.count({ where: { clientId: (session.user as any).id } });
    return NextResponse.json({
      stats: [
        { label: "My Bookings", value: myBookings.toString(), trend: "Upcoming" },
      ]
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
