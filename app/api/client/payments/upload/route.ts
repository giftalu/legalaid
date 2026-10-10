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
        // Authenticate the uploader.
        const client = await requireUser("CLIENT");

        if (!client) {
          throw new Error("You must be logged in as a client.");
        }

        if (!clientPayload) {
          throw new Error("Missing upload information.");
        }

        // Validate the case ID sent by the browser.
        let payload: { caseId?: unknown };

        try {
          payload = JSON.parse(clientPayload);
        } catch {
          throw new Error("Invalid upload information.");
        }

        const caseId = Number(payload.caseId);

        if (
          !Number.isInteger(caseId) ||
          caseId <= 0
        ) {
          throw new Error("Invalid case ID.");
        }

        // Only allow the requested path for this case.
        const requestedPrefix =
          `legal-aid/payments/${caseId}/`;

        if (!pathname.startsWith(requestedPrefix)) {
          throw new Error("Invalid upload path.");
        }

        // Confirm the case belongs to the logged-in client.
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

        // Keep only the filename from the requested path.
        const requestedName = pathname.split("/").pop() ?? "";

        const safeName = requestedName
          .replace(/[^a-zA-Z0-9._-]/g, "-")
          .slice(0, 180);

        if (
          !safeName ||
          safeName === "." ||
          safeName === ".."
        ) {
          throw new Error("Invalid filename.");
        }

        // Force the actual Blob path to include the client's ID.
        // This matches the path checked by submitPayment().
        const securePath =
          `legal-aid/${client.id}/payments/${caseId}/${safeName}`;

        return {
          pathname: securePath,
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
        // Vercel calls this callback after an upload completes.
        // The payment is recorded separately by submitPayment().
        if (!tokenPayload || !blob.url) {
          throw new Error("Upload completion could not be verified.");
        }
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment proof upload error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment proof upload failed.",
      },
      { status: 400 }
    );
  }
}

