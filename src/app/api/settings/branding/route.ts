import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "MARQUEE_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { primaryColor, logo } = await req.json();
    const marqueeId = (session.user as any).marqueeId;

    if (!marqueeId) {
      return NextResponse.json({ error: "No marquee associated with this account" }, { status: 400 });
    }

    const updatedMarquee = await prisma.marquee.update({
      where: { id: marqueeId },
      data: { primaryColor, logo },
    });

    return NextResponse.json({ success: true, marquee: updatedMarquee });
  } catch (error: any) {
    console.error("BRANDING_UPDATE_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
