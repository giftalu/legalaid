import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await requireUser("CLIENT");

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const caseType =
      String(body.caseType || "").trim();

    const description =
      String(body.description || "").trim();

    const nationalIdUrl =
      String(body.nationalIdUrl || "").trim();

    const nationalIdFileName =
      String(body.nationalIdFileName || "").trim();

    const recommendationUrl =
      String(body.recommendationUrl || "").trim();

    const recommendationFileName =
      String(
        body.recommendationFileName || ""
      ).trim();

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (!caseType) {
      return NextResponse.json(
        {
          error: "Case type is required.",
        },
        { status: 400 }
      );
    }

    if (description.length < 20) {
      return NextResponse.json(
        {
          error:
            "Case description must be at least 20 characters.",
        },
        { status: 400 }
      );
    }

    if (!nationalIdUrl) {
      return NextResponse.json(
        {
          error: "National ID is required.",
        },
        { status: 400 }
      );
    }

    if (!recommendationUrl) {
      return NextResponse.json(
        {
          error:
            "Recommendation letter is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Generate case number
    // -----------------------------------------

    const caseNumber =
      `LAB-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

    // -----------------------------------------
    // Create case
    // -----------------------------------------

    const newCase = await db.case.create({
      data: {
        caseNumber,
        userId: user.id,
        caseType,
        description,

        nationalIdUrl,
        nationalIdFileName,

        recommendationUrl,
        recommendationFileName,
      },
    });

    return NextResponse.json(
      {
        success: true,
        case: {
          id: newCase.id,
          caseNumber: newCase.caseNumber,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CASE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create case.",
      },
      {
        status: 500,
      }
    );
  }
}