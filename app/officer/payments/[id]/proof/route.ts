import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const officer = await requireUser("OFFICER");

    if (!officer) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const paymentId = Number(id);

    if (
      !Number.isInteger(paymentId) ||
      paymentId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: {
        id: paymentId,
      },
      select: {
        proofUrl: true,
        proofFileName: true,
      },
    });

    if (!payment?.proofUrl) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      );
    }

    const pathname = new URL(
      payment.proofUrl
    ).pathname;

    const blob = await get(pathname, {
      access: "private",
    });

    if (!blob) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      );
    }

    return new NextResponse(blob.stream, {
      headers: {
        "Content-Type":
          blob.blob.contentType ||
          "application/octet-stream",
        "Content-Disposition": `inline; filename="${payment.proofFileName || "payment-proof"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "PAYMENT PROOF ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Unable to open payment proof" },
      { status: 500 }
    );
  }
}