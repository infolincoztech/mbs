import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const marqueeId = (session.user as any).marqueeId;

  try {
    const staff = await prisma.staff.findMany({
      where: { marqueeId },
      include: {
        payrolls: {
          orderBy: { createdAt: "desc" },
          take: 5
        },
        advances: {
          orderBy: { date: "desc" },
          take: 10
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, email, designation, salary } = await req.json();
    const marqueeId = (session.user as any).marqueeId;

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        marqueeId,
        designation,
        salary: parseFloat(salary),
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("STAFF_CREATE_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
