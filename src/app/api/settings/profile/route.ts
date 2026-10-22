import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, marqueeName } = await req.json();
    const userId = (session.user as any).id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      include: { ownedMarquee: true }
    });

    if (marqueeName && updatedUser.ownedMarquee) {
      await prisma.marquee.update({
        where: { id: updatedUser.ownedMarquee.id },
        data: { name: marqueeName }
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("PROFILE_UPDATE_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
