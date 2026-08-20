"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteClientCase(formData: FormData) {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid case ID.");
  }

  // IMPORTANT:
  // Only delete a case belonging to the logged-in client.
  const existingCase = await db.case.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  await db.case.delete({
    where: {
      id: existingCase.id,
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

  const id = Number(formData.get("id"));

  const caseType = String(
    formData.get("caseType") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  if (!Number.isInteger(id) || id <= 0) {
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

  // Only allow the client to modify their own case.
  const existingCase = await db.case.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  // Once an officer has approved/rejected the case,
  // don't allow the client to overwrite the reviewed case.
  if (
    existingCase.status === "APPROVED" ||
    existingCase.status === "REJECTED" ||
    existingCase.status === "RESOLVED" ||
    existingCase.status === "CLOSED"
  ) {
    throw new Error(
      "This case can no longer be edited."
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