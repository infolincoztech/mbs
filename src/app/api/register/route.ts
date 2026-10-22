import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      marqueeName, 
      machineId, 
      osInfo, 
      hostname, 
      ipAddress 
    } = await req.json();

    if (!name || !email || !password || !marqueeName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "MARQUEE_ADMIN",
          phone: phone || null,
        },
      });

      const marquee = await tx.marquee.create({
        data: {
          name: marqueeName,
          slug: marqueeName.toLowerCase().replace(/ /g, "-"),
          ownerId: user.id,
          subscription: {
            create: {
              planType: "BASIC",
              status: "TRIAL",
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
            },
          },
        },
      });

      if (machineId) {
        const existingDevice = await tx.deviceLicense.findUnique({
          where: { machineId },
        });

        if (existingDevice) {
          await tx.deviceLicense.update({
            where: { machineId },
            data: {
              userId: user.id,
              clientName: name,
              osInfo: osInfo || existingDevice.osInfo,
              hostname: hostname || existingDevice.hostname,
              ipAddress: ipAddress || existingDevice.ipAddress,
            }
          });
        } else {
          await tx.deviceLicense.create({
            data: {
              machineId,
              userId: user.id,
              clientName: name,
              osInfo: osInfo || "Unknown OS",
              hostname: hostname || "Unknown Host",
              ipAddress: ipAddress || null,
              status: "PENDING",
              planType: "TRIAL",
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            }
          });
        }
      }

      return { user, marquee };
    });

    return NextResponse.json({ message: "Registered successfully", result });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
