
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

    const response = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const client = await requireUser("CLIENT");

        if (!client) {
          throw new Error("Unauthorized.");
        }

        let payload: { caseId?: number };

        try {
          payload = JSON.parse(clientPayload || "{}");
        } catch {
          throw new Error("Invalid upload request.");
        }

        const caseId = Number(payload.caseId);

        if (!Number.isInteger(caseId) || caseId <= 0) {
          throw new Error("Invalid case ID.");
        }

        const caseItem = await db.case.findFirst({
          where: {
            id: caseId,
            userId: client.id,
          },
          select: {
            id: true,
            assignedFee: true,
          },
        });

        if (!caseItem) {
          throw new Error("Case not found or unauthorized.");
        }

        if (Number(caseItem.assignedFee ?? 0) <= 0) {
          throw new Error("This case has not been charged yet.");
        }

        const expectedPrefix = `legal-aid/payments/${caseId}/`;
        const normalizedPath = pathname.replace(/^\/+/, "");

        if (!normalizedPath.startsWith(expectedPrefix)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: client.id,
            caseId,
          }),
        };
      },

      onUploadCompleted: async () => {
        // Payment recording remains in submitPayment().
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("PAYMENT PROOF UPLOAD ERROR:", error);

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
