import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const marquees = await prisma.marquee.findMany({
      include: {
        owner: true,
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(marquees);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { 
      name, 
      ownerName, 
      ownerEmail, 
      ownerPassword, 
      planType, 
      expiryDate,
      primaryColor,
      logo
    } = await req.json();

    if (!name || !ownerName || !ownerEmail || !ownerPassword || !expiryDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists. Use a different email." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    
    // Map planType from form value to valid enum
    const validPlanTypes = ["BASIC", "TRIAL", "MONTHLY", "HALF_YEARLY", "YEARLY", "LIFETIME"];
    const safePlanType = validPlanTypes.includes(planType) ? planType : "BASIC";
    const subscriptionStatus = (safePlanType === "TRIAL") ? "TRIAL" : "ACTIVE";

    // Create user first
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        password: hashedPassword,
        role: "MARQUEE_ADMIN",
      },
    });

    // Create marquee with subscription
    const marquee = await prisma.marquee.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now(),
        ownerId: user.id,
        primaryColor: primaryColor || "#2563eb",
        logo: logo || null,
        subscription: {
          create: {
            planType: safePlanType as any,
            status: subscriptionStatus as any,
            endDate: new Date(expiryDate),
          },
        },
      },
    });

    return NextResponse.json({ success: true, marquee });
  } catch (error: any) {
    console.error("MARQUEE_CREATE_ERROR", error);
    // Return actual error message for debugging
    return NextResponse.json({ 
      error: error?.message || "Internal server error",
      code: error?.code,
    }, { status: 500 });
  }
}
