"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

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

  if (!Number.isInteger(id)) {
    redirect("/client/dashboard?error=invalid-id");
  }

  if (!caseType || description.length < 20) {
    redirect(
      `/client/cases/${id}/edit?error=invalid`
    );
  }

  const existingCase = await db.case.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existingCase) {
    redirect("/client/dashboard?error=not-found");
  }

  /*
   * Once an officer has processed the case,
   * client cannot modify the case.
   */
  const protectedStatuses = [
    "APPROVED",
    "REJECTED",
    "IN_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
  ] as const;

  if (
    protectedStatuses.includes(
      existingCase.status as (typeof protectedStatuses)[number]
    )
  ) {
    redirect(
      "/client/dashboard?error=edit-locked"
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

  redirect("/client/dashboard?success=updated");
}