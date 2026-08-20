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
    );

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (
      documentType !== "national-id" &&
      documentType !== "recommendation"
    ) {
      return NextResponse.json(
        { error: "Invalid document type." },
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

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Upload JPG, PNG, WEBP or PDF.",
        },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "file";

    const safeFileName =
      `${documentType}-${user.id}-${Date.now()}.${extension}`;

    const blob = await put(
      `legal-aid/${user.id}/${safeFileName}`,
      file,
      {
        access: "private",
        addRandomSuffix: true,
        contentType: file.type,
      }
    );

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: file.name,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        error: "File upload failed.",
      },
      { status: 500 }
    );
  }
}