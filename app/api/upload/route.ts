import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(request: Request) {
  try {
    const user = await requireUser("CLIENT");

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const documentType = String(
      formData.get("documentType") || ""
    ).trim();

    // -----------------------------------------
    // Validate file
    // -----------------------------------------

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No file uploaded.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Validate document type
    // -----------------------------------------

    if (
      documentType !== "national-id" &&
      documentType !== "recommendation"
    ) {
      return NextResponse.json(
        {
          error: "Invalid document type.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Validate file size
    // -----------------------------------------

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "File is too large. Maximum allowed size is 5 MB.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Validate file type
    // -----------------------------------------

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Upload JPG, PNG, WEBP or PDF.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Get extension
    // -----------------------------------------

    const originalExtension =
      file.name.split(".").pop()?.toLowerCase() || "file";

    const extension = originalExtension.replace(
      /[^a-z0-9]/g,
      ""
    );

    // -----------------------------------------
    // Create safe filename
    // -----------------------------------------

    const safeFileName =
      `${documentType}-${user.id}-${Date.now()}.${extension}`;

    // -----------------------------------------
    // Upload to Vercel Blob
    // -----------------------------------------

    const blob = await put(
      `legal-aid/${user.id}/${safeFileName}`,
      file,
      {
        access: "private",
        addRandomSuffix: true,
        contentType: file.type,
      }
    );

    console.log("FILE UPLOADED:", {
      userId: user.id,
      documentType,
      fileName: file.name,
      blobUrl: blob.url,
    });

    return NextResponse.json(
      {
        success: true,
        url: blob.url,
        fileName: file.name,
        documentType,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "File upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}