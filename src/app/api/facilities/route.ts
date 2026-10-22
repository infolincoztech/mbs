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
    const facilities = await prisma.facility.findMany({
      where: { marqueeId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(facilities);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, price } = await req.json();
    const marqueeId = (session.user as any).marqueeId;

    const facility = await prisma.facility.create({
      data: {
        name,
        price: parseFloat(price),
        marqueeId,
      },
    });

    return NextResponse.json(facility);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
