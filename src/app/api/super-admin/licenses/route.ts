import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const licenses = await prisma.deviceLicense.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            ownedMarquee: {
              select: {
                id: true,
                name: true,
                subscription: {
                  select: {
                    id: true,
                    planType: true,
                    status: true,
                    endDate: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(licenses);
  } catch (error) {
    console.error("GET_LICENSES_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, clientName, status, planType, endDate } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing license ID" }, { status: 400 });
    }

    const currentLicense = await prisma.deviceLicense.findUnique({
      where: { id },
      include: { user: { include: { ownedMarquee: true } } }
    });

    const dataToUpdate: any = {
      clientName: clientName !== undefined ? clientName : undefined,
      status: status !== undefined ? status : undefined,
      planType: planType !== undefined ? planType : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const updated = await prisma.$transaction(async (tx: any) => {
      const dev = await tx.deviceLicense.update({
        where: { id },
        data: dataToUpdate,
      });

      if (status !== undefined && currentLicense?.user?.ownedMarquee) {
        const marqueeId = currentLicense.user.ownedMarquee.id;
        
        let subStatus: any = "TRIAL";
        if (status === "ACTIVE") {
          subStatus = "ACTIVE";
        } else if (status === "BLOCKED") {
          subStatus = "SUSPENDED";
        }

        const subPlanType = planType || currentLicense.planType;
        const subEndDate = endDate ? new Date(endDate) : currentLicense.endDate;

        const existingSub = await tx.subscription.findUnique({
          where: { marqueeId }
        });

        if (existingSub) {
          await tx.subscription.update({
            where: { marqueeId },
            data: {
              status: subStatus,
              planType: subPlanType,
              endDate: subEndDate
            }
          });
        }
      }

      return dev;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH_LICENSE_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing license ID" }, { status: 400 });
    }

    await prisma.deviceLicense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_LICENSE_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
