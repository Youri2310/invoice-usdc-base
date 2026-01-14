// src/app/api/payment/[invoiceId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    const payment = await prisma.payment.findFirst({
      where: { invoiceId },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      return NextResponse.json({ payment: null });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}
