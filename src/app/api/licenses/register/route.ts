import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { machineId, clientName, osInfo, hostname, ipAddress: clientIp } = await req.json();

    if (!machineId) {
      return NextResponse.json({ error: "Missing machineId" }, { status: 400 });
    }

    const ipAddress = clientIp || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || null;

    // Check if device already registered
    let device = await prisma.deviceLicense.findUnique({
      where: { machineId },
    });

    if (!device) {
      // Create new pending device license
      // Default end date is 14 days from now (align with trials)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      device = await prisma.deviceLicense.create({
        data: {
          machineId,
          clientName: clientName || "New PC Client",
          osInfo: osInfo || "Unknown OS",
          hostname: hostname || "Unknown Host",
          ipAddress: ipAddress,
          status: "PENDING",
          planType: "TRIAL",
          endDate: trialEndDate,
        },
      });
    } else {
      // Update system details if changed
      device = await prisma.deviceLicense.update({
        where: { machineId },
        data: {
          osInfo: osInfo || device.osInfo,
          hostname: hostname || device.hostname,
          ipAddress: ipAddress || device.ipAddress,
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: device.status,
      planType: device.planType,
      endDate: device.endDate,
    });
  } catch (error: any) {
    console.error("LICENSE_REGISTRATION_ERROR", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
