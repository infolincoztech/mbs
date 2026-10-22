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
    const { amount } = await req.json();

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        advanceTaken: { increment: parseFloat(amount) }
      }
    });

    // Create formal advance record
    await prisma.advance.create({
      data: {
        staffId: id,
        amount: parseFloat(amount),
        date: new Date(),
      }
    });

    // Also record it as an expense
    await prisma.financialRecord.create({
      data: {
        marqueeId: staff.marqueeId,
        type: "EXPENSE",
        amount: parseFloat(amount),
        category: "Advance Wages",
        description: `Advance given to ${staff.name}`,
        date: new Date()
      }
    });

    return NextResponse.json(staff);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
