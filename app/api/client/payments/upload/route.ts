
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const result = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (
        pathname,
        clientPayload
      ) => {
        const client = await requireUser("CLIENT");

        if (!client) {
          throw new Error("You must be logged in as a client.");
        }

        if (!clientPayload) {
          throw new Error("Missing upload information.");
        }

        let payload: { caseId?: unknown };

        try {
          payload = JSON.parse(clientPayload);
        } catch {
          throw new Error("Invalid upload information.");
        }

        const caseId = Number(payload.caseId);

        if (!Number.isSafeInteger(caseId) || caseId <= 0) {
          throw new Error("Invalid case ID.");
        }

        const caseItem = await db.case.findFirst({
          where: {
            id: caseId,
            userId: client.id,
          },
          select: {
            id: true,
          },
        });

        if (!caseItem) {
          throw new Error(
            "You are not authorized to upload proof for this case."
          );
        }

        const requestedName =
          pathname.split("/").pop() ?? "";

        const safeName = requestedName
          .normalize("NFKC")
          .replace(/[^a-zA-Z0-9._-]/g, "-")
          .slice(0, 180);

        if (
          !safeName ||
          safeName === "." ||
          safeName === ".."
        ) {
          throw new Error("Invalid filename.");
        }

        return {
          pathname:
            `legal-aid/${client.id}/payments/${caseId}/${safeName}`,
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            clientId: client.id,
            caseId,
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload || !blob.url) {
          throw new Error(
            "Upload completion could not be verified."
          );
        }
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment proof upload error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Payment proof upload failed.";

    // Do not expose internal storage or infrastructure errors.
    const isAuthError =
      message.includes("logged in") ||
      message.includes("authorized");

    return NextResponse.json(
      {
        error: isAuthError
          ? message
          : "Payment proof upload failed. Please try again.",
      },
      { status: isAuthError ? 403 : 400 }
    );
  }
}

