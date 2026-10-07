
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
    type: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    // ============================================
    // AUTHENTICATE OFFICER
    // ============================================

    const officer = await requireUser("OFFICER");

    if (!officer) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ============================================
    // GET ROUTE PARAMETERS
    // ============================================

    const { id, type } = await context.params;

    // ============================================
    // VALIDATE DOCUMENT TYPE
    // ============================================

    if (
      type !== "national-id" &&
      type !== "recommendation"
    ) {
      return NextResponse.json(
        { error: "Invalid document type." },
        { status: 400 }
      );
    }

    // ============================================
    // FIND CASE
    // ============================================

    const caseRecord = await db.case.findUnique({
      where: {
        id:Number(id),
      },
      select: {
        id: true,
        nationalIdUrl: true,
        recommendationUrl: true,
      },
    });

    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    // ============================================
    // SELECT DOCUMENT URL
    // ============================================

    const documentUrl =
      type === "national-id"
        ? caseRecord.nationalIdUrl
        : caseRecord.recommendationUrl;

    if (!documentUrl) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // ============================================
    // EXTRACT BLOB PATHNAME
    // ============================================

    let pathname: string;

    try {
      const url = new URL(documentUrl);

      pathname = decodeURIComponent(
        url.pathname.replace(/^\/+/, "")
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid document URL." },
        { status: 500 }
      );
    }

    if (!pathname) {
      return NextResponse.json(
        { error: "Invalid document pathname." },
        { status: 500 }
      );
    }

    console.log("PRIVATE DOCUMENT REQUEST:", {
      officerId: officer.id,
      caseId: caseRecord.id,
      documentType: type,
      pathname,
    });

    // ============================================
    // READ PRIVATE VERCEL BLOB
    // ============================================

    const result = await get(pathname, {
      access: "private",
    });

    if (!result) {
      return NextResponse.json(
        { error: "Document could not be retrieved." },
        { status: 404 }
      );
    }

    // ============================================
    // RETURN FILE TO BROWSER
    // ============================================

    const headers = new Headers();

    headers.set(
      "Content-Type",
      result.blob.contentType ||
        "application/octet-stream"
    );

    headers.set(
      "Content-Disposition",
      "inline"
    );

    // Prevent browsers/proxies from caching
    // sensitive legal documents.
    headers.set(
      "Cache-Control",
      "private, no-store, max-age=0"
    );

    return new Response(result.stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(
      "PRIVATE DOCUMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve document.",
      },
      {
        status: 500,
      }
    );
  }
}

