import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.$transaction([
      prisma.subscription.deleteMany({ where: { marqueeId: id } }),
      prisma.hall.deleteMany({ where: { marqueeId: id } }),
      prisma.package.deleteMany({ where: { marqueeId: id } }),
      prisma.staff.deleteMany({ where: { marqueeId: id } }),
      prisma.marquee.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Marquee deleted successfully" });
  } catch (error) {
    console.error("MARQUEE_DELETE_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, primaryColor, planType, endDate, address, contactPhone, contactEmail, logo } = body;

    const updatedMarquee = await prisma.marquee.update({
      where: { id },
      data: {
        name,
        primaryColor,
        address,
        contactPhone,
        contactEmail,
        logo,
        subscription: {
          update: {
            planType,
            endDate: endDate ? new Date(endDate) : undefined,
          }
        }
      },
      include: {
        subscription: true
      }
    });

    return NextResponse.json(updatedMarquee);
  } catch (error) {
    console.error("MARQUEE_UPDATE_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
