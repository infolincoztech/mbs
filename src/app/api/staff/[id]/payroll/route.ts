import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { advanceDeducted, bonus } = await req.json();

    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    // Check if salary already paid this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        staffId: id,
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      }
    });

    if (existingPayroll) {
      return NextResponse.json({ error: "Salary for this month has already been paid." }, { status: 400 });
    }

    const baseSalary = staff.salary;
    const netPaid = baseSalary - parseFloat(advanceDeducted || "0") + parseFloat(bonus || "0");

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Payroll Record
      const payroll = await tx.payroll.create({
        data: {
          staffId: id,
          marqueeId: staff.marqueeId,
          baseSalary,
          advanceDeducted: parseFloat(advanceDeducted || "0"),
          bonus: parseFloat(bonus || "0"),
          netPaid,
          month: new Date()
        }
      });

      // 2. Reduce advance balance
      await tx.staff.update({
        where: { id },
        data: {
          advanceTaken: { decrement: parseFloat(advanceDeducted || "0") }
        }
      });

      // 3. Record as an expense
      await tx.financialRecord.create({
        data: {
          marqueeId: staff.marqueeId,
          type: "EXPENSE",
          amount: netPaid,
          category: "Daily Wages",
          description: `Daily Wages paid to ${staff.name} (Base: ${baseSalary}, Deducted: ${advanceDeducted}, Bonus: ${bonus})`
        }
      });

      return payroll;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
