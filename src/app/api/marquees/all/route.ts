import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const marquees = await prisma.marquee.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          }
        },
        subscription: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });
    
    return NextResponse.json(marquees);
  } catch (error) {
    console.error("MARQUEES_GET_ERROR", error);
    return NextResponse.json({ error: "Failed to fetch marquees" }, { status: 500 });
  }
}
