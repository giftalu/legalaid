import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      type: string;
    }>;
  }
) {
  try {
    const user = await requireUser("CLIENT");

    if (!user) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const { id, type } = await params;

    if (
      type !== "national-id" &&
      type !== "recommendation"
    ) {
      return new NextResponse("Invalid document type", {
        status: 400,
      });
    }

    const caseData = await db.case.findFirst({
      where: {
       id: Number(id),
        userId: user.id,
      },
    });

    if (!caseData) {
      return new NextResponse("Case not found", {
        status: 404,
      });
    }

    const url =
      type === "national-id"
        ? caseData.nationalIdUrl
        : caseData.recommendationUrl;

    const fileName =
      type === "national-id"
        ? caseData.nationalIdFileName
        : caseData.recommendationFileName;

    if (!url) {
      return new NextResponse("Document not found", {
        status: 404,
      });
    }

    const blobResponse = await fetch(url);

    if (!blobResponse.ok) {
      return new NextResponse(
        "Unable to retrieve stored document",
        {
          status: 502,
        }
      );
    }

    const contentType =
      blobResponse.headers.get("content-type") ||
      "application/octet-stream";

    const buffer = await blobResponse.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,

      headers: {
        "Content-Type": contentType,

        "Content-Disposition": `inline; filename="${
          fileName || "document"
        }"`,

        "Cache-Control":
          "private, no-store, max-age=0",

        "X-Content-Type-Options":
          "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "DOCUMENT PREVIEW ERROR:",
      error
    );

    return new NextResponse(
      "Unable to preview document",
      {
        status: 500,
      }
    );
  }
}