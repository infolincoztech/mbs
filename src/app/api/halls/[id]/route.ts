import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { name, capacity, pricePerSlot, pricePerHead, features, status } = await req.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (pricePerSlot !== undefined) updateData.pricePerSlot = parseFloat(pricePerSlot);
    if (pricePerHead !== undefined) updateData.pricePerHead = parseFloat(pricePerHead);
    if (features !== undefined) updateData.features = features;
    if (status !== undefined) updateData.status = status;

    const hall = await prisma.hall.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(hall);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.hall.delete({ where: { id } });
    return NextResponse.json({ message: "Hall deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
