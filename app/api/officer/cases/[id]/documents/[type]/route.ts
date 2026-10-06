import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
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
    const officer = await requireUser("OFFICER");

    if (!officer) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const { id, type } = await params;

    const caseId = Number(id);

    if (!Number.isInteger(caseId) || caseId <= 0) {
      return new NextResponse("Invalid case ID", {
        status: 400,
      });
    }

    if (
      type !== "national-id" &&
      type !== "recommendation"
    ) {
      return new NextResponse("Invalid document type", {
        status: 400,
      });
    }

    const caseData = await db.case.findUnique({
      where: {
        id: caseId,
      },
      select: {
        id: true,

        nationalIdUrl: true,
        nationalIdFileName: true,

        recommendationUrl: true,
        recommendationFileName: true,
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

    console.log("OFFICER DOCUMENT URL:", url);

    const blobUrl = new URL(url);

    const pathname = decodeURIComponent(
      blobUrl.pathname.replace(/^\/+/, "")
    );

    console.log("OFFICER BLOB PATHNAME:", pathname);

    const result = await get(pathname, {
      access: "private",
    });

    if (!result) {
      return new NextResponse("Document not found", {
        status: 404,
      });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Content-Type":
          result.blob.contentType ||
          "application/octet-stream",

        "Content-Disposition":
          `inline; filename="${(
            fileName || "document"
          ).replace(/"/g, "")}"`,

        "Cache-Control":
          "private, no-store, max-age=0",

        "X-Content-Type-Options":
          "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "OFFICER DOCUMENT ERROR:",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
    );

    return new NextResponse(
      "Unable to retrieve stored document",
      {
        status: 502,
      }
    );
  }
}