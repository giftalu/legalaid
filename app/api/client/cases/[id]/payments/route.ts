import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await requireUser("CLIENT");

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          error: "Invalid payment amount",
        },
        { status: 400 }
      );
    }

    const caseData = await db.case.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!caseData) {
      return NextResponse.json(
        {
          error: "Case not found",
        },
        { status: 404 }
      );
    }

    const reference =
      `PAY-${Date.now()}-` +
      crypto.randomBytes(4).toString("hex").toUpperCase();

    const payment = await db.payment.create({
      data: {
        caseId: caseData.id,
        userId: user.id,
        amount,
        currency: "MWK",
        reference,
        status: "PENDING",
        provider: "PENDING_INTEGRATION",
        description:
          "Legal aid case payment",
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error(
      "PAYMENT CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to create payment",
      },
      { status: 500 }
    );
  }
}