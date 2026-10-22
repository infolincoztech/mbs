import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const machineId = searchParams.get("machineId");

    if (!machineId) {
      return NextResponse.json({ error: "Missing machineId" }, { status: 400 });
    }

    const device = await prisma.deviceLicense.findUnique({
      where: { machineId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
            ownedMarquee: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    if (!device) {
      return NextResponse.json({
        active: false,
        status: "NOT_FOUND",
        message: "Device not registered.",
      });
    }

    const isExpired = new Date() > new Date(device.endDate);

    if (device.status !== "ACTIVE") {
      return NextResponse.json({
        active: false,
        status: device.status,
        message: `Device is currently ${device.status}.`,
        user: device.user,
      });
    }

    if (isExpired) {
      return NextResponse.json({
        active: false,
        status: "EXPIRED",
        planType: device.planType,
        endDate: device.endDate,
        message: "License has expired.",
        user: device.user,
      });
    }

    return NextResponse.json({
      active: true,
      status: device.status,
      planType: device.planType,
      endDate: device.endDate,
      user: device.user,
    });
  } catch (error: any) {
    console.error("LICENSE_CHECK_ERROR", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
