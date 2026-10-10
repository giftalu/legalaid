
import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
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

    // Vercel Blob's get() expects the blob pathname.
    let pathname = payment.proofUrl;

    if (pathname.startsWith("https://") ||
        pathname.startsWith("http://")) {
      pathname = new URL(pathname).pathname;
    }

    pathname = decodeURIComponent(pathname).replace(/^\/+/, "");

    const blob = await get(pathname, {
      access: "private",
    });

    if (!blob) {
      return NextResponse.json(
        { error: "Payment proof not found" },
        { status: 404 }
      );
    }

    const filename = (payment.proofFileName || "payment-proof")
      .replace(/[\r\n"]/g, "_");

    return new Response(blob.stream, {
      headers: {
        "Content-Type":
          blob.blob.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Payment proof retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve payment proof" },
      { status: 500 }
    );
  }
}

