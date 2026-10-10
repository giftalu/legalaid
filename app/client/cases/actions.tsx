
"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Delete a case belonging to the logged-in client.
 */
export async function deleteClientCase(formData: FormData) {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const rawId = formData.get("id");
  const id = Number(rawId);

  if (
    typeof rawId !== "string" ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error("Invalid case ID.");
  }

  const existingCase = await db.case.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found or you do not have permission to delete it.");
  }

  await db.case.delete({
    where: {
      id: existingCase.id,
    },
  });

  revalidatePath("/client/dashboard");

  redirect("/client/dashboard");
}

/**
 * Update a case belonging to the logged-in client.
 */
export async function updateClientCase(formData: FormData) {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const rawId = formData.get("id");
  const id = Number(rawId);

  const rawCaseType = formData.get("caseType");
  const rawDescription = formData.get("description");

  const caseType =
    typeof rawCaseType === "string"
      ? rawCaseType.trim()
      : "";

  const description =
    typeof rawDescription === "string"
      ? rawDescription.trim()
      : "";

  if (
    typeof rawId !== "string" ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error("Invalid case ID.");
  }

  if (!caseType) {
    throw new Error("Case type is required.");
  }

  if (description.length < 20) {
    throw new Error(
      "Case description must be at least 20 characters."
    );
  }

  const existingCase = await db.case.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found or you do not have permission to edit it.");
  }

  const lockedStatuses = [
    "APPROVED",
    "REJECTED",
    "RESOLVED",
    "CLOSED",
  ];

  if (lockedStatuses.includes(existingCase.status)) {
    throw new Error(
      "This case can no longer be edited because it has already been reviewed."
    );
  }

  await db.case.update({
    where: {
      id: existingCase.id,
    },
    data: {
      caseType,
      description,
    },
  });

  revalidatePath("/client/dashboard");
  revalidatePath(`/client/cases/${id}`);
  revalidatePath(`/client/cases/${id}/edit`);

  redirect(`/client/cases/${id}`);
}
