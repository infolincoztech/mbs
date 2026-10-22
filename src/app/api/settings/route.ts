import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, marqueeName, primaryColor, logo, currentPassword, newPassword } = body;
    const userId = (session.user as any).id;

    // Update User Profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
      }
    });

    // If Marquee Admin, update Marquee Branding
    if ((session.user as any).role === "MARQUEE_ADMIN") {
      const marquee = await prisma.marquee.findUnique({
        where: { ownerId: userId }
      });

      if (marquee) {
        await prisma.marquee.update({
          where: { id: marquee.id },
          data: {
            name: marqueeName,
            primaryColor,
            logo,
          }
        });
      }
    }

    // Password Update Logic (Optional, if provided)
    // if (currentPassword && newPassword) { ... }

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
