import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("Lincoz@Tech-2", 10);

    // 1. Super Admin
    const user = await prisma.user.upsert({
      where: { email: "lincoztech@gmail.com" },
      update: {
        role: "SUPER_ADMIN",
        password: hashedPassword,
      },
      create: {
        email: "lincoztech@gmail.com",
        name: "Lincoz Super Admin",
        password: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Super Admin account created/updated",
      email: user.email 
    });
  } catch (error: any) {
    console.error("SETUP_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
