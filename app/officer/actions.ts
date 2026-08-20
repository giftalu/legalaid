"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  CaseStatus,
  ConsultationStatus,
} from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";




/**
 * Approve or reject a case
 */
export async function updateCaseStatus(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));
  const statusValue = String(formData.get("status") || "");
  const comment = String(
    formData.get("comment") || ""
  ).trim();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid Case ID is required.");
  }

  if (
    statusValue !== "APPROVED" &&
    statusValue !== "REJECTED"
  ) {
    throw new Error("Invalid case status.");
  }

  const status =
    statusValue === "APPROVED"
      ? CaseStatus.APPROVED
      : CaseStatus.REJECTED;

  await db.case.update({
    where: {
      id,
    },
    data: {
      status,
      officerComment: comment || null,
      reviewedById: officer.id,
    },
  });

  revalidatePath("/officer/dashboard");
  revalidatePath(`/officer/cases/${id}`);
  revalidatePath(`/officer/cases/${id}/edit`);
  revalidatePath("/client/dashboard");
}

/**
 * Schedule a consultation
 */
export async function scheduleConsultation(
  formData: FormData
) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));

  const consultationDate = String(
    formData.get("consultationDate") || ""
  );

  const consultationTime = String(
    formData.get("consultationTime") || ""
  );

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid Case ID is required.");
  }

  if (!consultationDate || !consultationTime) {
    throw new Error(
      "Consultation date and time are required."
    );
  }

  const consultationAt = new Date(
    `${consultationDate}T${consultationTime}:00`
  );

  if (Number.isNaN(consultationAt.getTime())) {
    throw new Error(
      "Invalid consultation date or time."
    );
  }

  await db.case.update({
    where: {
      id,
    },
    data: {
      consultationAt,
      consultationStatus:
        ConsultationStatus.SCHEDULED,
    },
  });

  revalidatePath("/officer/dashboard");
  revalidatePath(`/officer/cases/${id}`);
  revalidatePath(`/officer/cases/${id}/edit`);
  revalidatePath("/client/dashboard");
}

/**
 * Edit a case
 */
export async function updateCase(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));

  const caseType = String(
    formData.get("caseType") || ""
  ).trim();

  const description = String(
    formData.get("description") || ""
  ).trim();

  const statusValue = String(
    formData.get("status") || ""
  );

  const officerComment = String(
    formData.get("officerComment") || ""
  ).trim();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid Case ID is required.");
  }

  if (!caseType) {
    throw new Error("Case type is required.");
  }

  if (!description) {
    throw new Error(
      "Case description is required."
    );
  }

  const validStatuses: CaseStatus[] = [
    CaseStatus.PENDING,
    CaseStatus.APPROVED,
    CaseStatus.REJECTED,
    CaseStatus.IN_REVIEW,
    CaseStatus.ASSIGNED,
    CaseStatus.IN_PROGRESS,
    CaseStatus.RESOLVED,
    CaseStatus.CLOSED,
  ];

  if (
    !validStatuses.includes(
      statusValue as CaseStatus
    )
  ) {
    throw new Error("Invalid case status.");
  }

  const status = statusValue as CaseStatus;

  await db.case.update({
    where: {
      id,
    },
    data: {
      caseType,
      description,
      status,
      officerComment: officerComment || null,
    },
  });

  revalidatePath("/officer/dashboard");
  revalidatePath(`/officer/cases/${id}`);
  revalidatePath(`/officer/cases/${id}/edit`);
  revalidatePath("/client/dashboard");

  redirect(`/officer/cases/${id}`);
}

/**
 * Delete a case
 */
export async function deleteCase(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Valid Case ID is required.");
  }

  await db.case.delete({
    where: {
      id,
    },
  });
  

  revalidatePath("/officer/dashboard");
  revalidatePath("/client/dashboard");

  redirect("/officer/dashboard");
}
