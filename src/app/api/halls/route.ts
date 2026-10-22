import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const marqueeId = searchParams.get("marqueeId") || (session.user as any).marqueeId;

  if (!marqueeId) {
    return NextResponse.json({ error: "Marquee ID required" }, { status: 400 });
  }

  try {
    const halls = await prisma.hall.findMany({
      where: { marqueeId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(halls);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, capacity, pricePerSlot, pricePerHead, features } = await req.json();
    const marqueeId = (session.user as any).marqueeId;

    if (!marqueeId) {
      return NextResponse.json({ error: "No marquee associated with user" }, { status: 400 });
    }

    const hall = await prisma.hall.create({
      data: {
        name,
        capacity: parseInt(capacity),
        pricePerSlot: parseFloat(pricePerSlot),
        pricePerHead: parseFloat(pricePerHead || "0"),
        features,
        marqueeId,
      },
    });

    return NextResponse.json(hall);
  } catch (error) {
    console.error("HALL_CREATE_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
