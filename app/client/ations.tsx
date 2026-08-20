"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteClientCase(formData: FormData) {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const rawId = formData.get("id");
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid case ID.");
  }

  // Make sure the case belongs to this client
  const caseItem = await db.case.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!caseItem) {
    throw new Error(
      "Case not found or you are not authorized to delete it."
    );
  }

  // Do not allow deletion after officer processing
  const protectedStatuses = [
    "APPROVED",
    "REJECTED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ];

  if (protectedStatuses.includes(caseItem.status)) {
    throw new Error(
      "This case can no longer be deleted because it has already been processed."
    );
  }

  await db.case.delete({
    where: {
      id: caseItem.id,
    },
  });

  revalidatePath("/client/dashboard");

  redirect("/client/dashboard");
}

export async function updateClientCase(formData: FormData) {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const rawId = formData.get("id");
  const id = Number(rawId);

  const caseType = formData.get("caseType");
  const description = formData.get("description");

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid case ID.");
  }

  if (typeof caseType !== "string" || !caseType.trim()) {
    throw new Error("Case type is required.");
  }

  if (
    typeof description !== "string" ||
    description.trim().length < 20
  ) {
    throw new Error(
      "Case description must be at least 20 characters."
    );
  }

  // Make sure the case belongs to this client
  const caseItem = await db.case.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!caseItem) {
    throw new Error(
      "Case not found or you are not authorized to edit it."
    );
  }

  // Do not allow editing after officer processing
  const protectedStatuses = [
    "APPROVED",
    "REJECTED",
    "RESOLVED",
    "CLOSED",
  ];

  if (protectedStatuses.includes(caseItem.status)) {
    throw new Error(
      "This case can no longer be edited because it has already been processed."
    );
  }

  await db.case.update({
    where: {
      id: caseItem.id,
    },
    data: {
      caseType: caseType.trim(),
      description: description.trim(),
    },
  });

  revalidatePath("/client/dashboard");
  revalidatePath(`/client/cases/${caseItem.id}`);
  revalidatePath(`/client/cases/${caseItem.id}/edit`);

  redirect(`/client/cases/${caseItem.id}`);
}