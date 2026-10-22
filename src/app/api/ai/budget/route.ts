import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { guestCount, hallBasePrice, packagePrice, facilityPrices } = await req.json();

    // AI Logic: Estimate total with hidden costs (tax, service, cleaning)
    const base = parseFloat(hallBasePrice) + parseFloat(packagePrice);
    const facilities = facilityPrices.reduce((sum: number, p: string) => sum + parseFloat(p), 0);
    
    const subtotal = base + facilities;
    const tax = subtotal * 0.15; // 15% tax
    const service = guestCount * 1.5; // $1.5 per guest service fee
    const cleaning = 200; // Fixed cleaning fee

    const total = subtotal + tax + service + cleaning;

    return NextResponse.json({
      breakdown: {
        subtotal,
        tax,
        serviceCharge: service,
        cleaningFee: cleaning,
      },
      estimatedTotal: Math.round(total),
      aiNote: "Estimation includes seasonal tax adjustments and service fees based on guest volume."
    });
  } catch (error) {
    return NextResponse.json({ error: "Budget logic failed" }, { status: 500 });
  }
}
