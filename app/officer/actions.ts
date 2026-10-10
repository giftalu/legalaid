
"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  CaseStatus,
  ConsultationStatus,
  PaymentStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Validate a positive integer ID.
 */
function getValidId(
  value: FormDataEntryValue | null,
  label: string
): number {
  if (value === null || String(value).trim() === "") {
    throw new Error(`Valid ${label} is required.`);
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Valid ${label} is required.`);
  }

  return id;
}

/**
 * Revalidate pages affected by case changes.
 */
function refreshCasePages(id: number) {
  revalidatePath("/officer/dashboard");
  revalidatePath("/officer/cases");
  revalidatePath(`/officer/cases/${id}`);
  revalidatePath(`/officer/cases/${id}/edit`);
  revalidatePath("/officer/reports");
  revalidatePath("/client/dashboard");
}

/**
 * Approve or reject a case.
 */
export async function updateCaseStatus(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = getValidId(formData.get("id"), "Case ID");
  const statusValue = String(formData.get("status") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();

  if (
    statusValue !== CaseStatus.APPROVED &&
    statusValue !== CaseStatus.REJECTED
  ) {
    throw new Error("Invalid case status.");
  }

  if (comment.length > 5000) {
    throw new Error("Officer comment must not exceed 5000 characters.");
  }

  await db.case.update({
    where: { id },
    data: {
      status: statusValue as CaseStatus,
      officerComment: comment || null,
      reviewedById: officer.id,
    },
  });

  refreshCasePages(id);
}

/**
 * Schedule a consultation.
 */
export async function scheduleConsultation(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = getValidId(formData.get("id"), "Case ID");

  const consultationDate = String(
    formData.get("consultationDate") ?? ""
  ).trim();

  const consultationTime = String(
    formData.get("consultationTime") ?? ""
  ).trim();

  if (!consultationDate || !consultationTime) {
    throw new Error("Consultation date and time are required.");
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(consultationDate) ||
    !/^\d{2}:\d{2}$/.test(consultationTime)
  ) {
    throw new Error("Invalid consultation date or time.");
  }

  const consultationAt = new Date(
    `${consultationDate}T${consultationTime}:00`
  );

  if (
    Number.isNaN(consultationAt.getTime()) ||
    consultationAt.getFullYear() !==
      Number(consultationDate.slice(0, 4)) ||
    consultationAt.getMonth() + 1 !==
      Number(consultationDate.slice(5, 7)) ||
    consultationAt.getDate() !==
      Number(consultationDate.slice(8, 10))
  ) {
    throw new Error("Invalid consultation date or time.");
  }

  await db.case.update({
    where: { id },
    data: {
      consultationAt,
      consultationStatus: ConsultationStatus.SCHEDULED,
    },
  });

  refreshCasePages(id);
}

/**
 * Edit a case.
 */
export async function updateCase(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = getValidId(formData.get("id"), "Case ID");

  const caseType = String(
    formData.get("caseType") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const statusValue = String(
    formData.get("status") ?? ""
  );

  const officerComment = String(
    formData.get("officerComment") ?? ""
  ).trim();

  if (!caseType) {
    throw new Error("Case type is required.");
  }

  if (!description) {
    throw new Error("Case description is required.");
  }

  if (caseType.length > 200) {
    throw new Error("Case type is too long.");
  }

  if (description.length > 20000) {
    throw new Error("Case description is too long.");
  }

  if (officerComment.length > 5000) {
    throw new Error("Officer comment must not exceed 5000 characters.");
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

  if (!validStatuses.includes(statusValue as CaseStatus)) {
    throw new Error("Invalid case status.");
  }

  await db.case.update({
    where: { id },
    data: {
      caseType,
      description,
      status: statusValue as CaseStatus,
      officerComment: officerComment || null,
    },
  });

  refreshCasePages(id);

  redirect(`/officer/cases/${id}`);
}

/**
 * Delete a case.
 */
export async function deleteCase(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = getValidId(formData.get("id"), "Case ID");

  await db.case.delete({
    where: { id },
  });

  revalidatePath("/officer/dashboard");
  revalidatePath("/officer/cases");
  revalidatePath("/client/dashboard");

  redirect("/officer/dashboard");
}

/**
 * Charge a case.
 */
export async function chargeCase(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const id = getValidId(formData.get("id"), "Case ID");

  const amountValue = String(
    formData.get("amount") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(amountValue)) {
    throw new Error(
      "Enter a valid amount with up to two decimal places."
    );
  }

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Charge amount must be greater than zero.");
  }

  if (amount > 1_000_000_000) {
    throw new Error("Charge amount is too large.");
  }

  if (description.length > 500) {
    throw new Error("Charge description must be 500 characters or less.");
  }

  const existingCase = await db.case.findUnique({
    where: { id },
    select: {
      id: true,
      caseNumber: true,
    },
  });

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  await db.case.update({
    where: { id },
    data: {
      assignedFee: amount,
      feeDescription: description || null,
      feeAssignedAt: new Date(),
    },
  });

  refreshCasePages(id);
}

/**
 * Review a client payment.
 *
 * PAID = the officer verified and approved the payment.
 * FAILED = the officer rejected the submitted payment.
 */
export async function reviewPayment(formData: FormData) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const paymentId = getValidId(
    formData.get("paymentId"),
    "Payment ID"
  );

  const decisionValue = String(
    formData.get("decision") ?? ""
  ).trim();

  if (
    decisionValue !== PaymentStatus.PAID &&
    decisionValue !== PaymentStatus.FAILED
  ) {
    throw new Error("Invalid payment decision.");
  }

  const decision = decisionValue as PaymentStatus;

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      caseId: true,
      status: true,
      proofUrl: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (!payment.proofUrl) {
    throw new Error(
      "No payment proof is attached. The payment cannot be reviewed."
    );
  }

  if (
    payment.status !== PaymentStatus.PENDING &&
    payment.status !== PaymentStatus.PROCESSING
  ) {
    throw new Error(
      "This payment has already been reviewed or is no longer reviewable."
    );
  }

  // Only update if the payment is still awaiting review.
  // This prevents conflicting decisions from concurrent requests.
  const result = await db.payment.updateMany({
    where: {
      id: paymentId,
      status: {
        in: [
          PaymentStatus.PENDING,
          PaymentStatus.PROCESSING,
        ],
      },
    },
    data: {
      status: decision,
      paymentReviewedAt: new Date(),
      paymentReviewedById: officer.id,
      paidAt:
        decision === PaymentStatus.PAID
          ? new Date()
          : null,
    },
  });

  if (result.count !== 1) {
    throw new Error(
      "The payment has already changed. Refresh the page and try again."
    );
  }

  revalidatePath("/officer/dashboard");
  revalidatePath("/officer/cases");
  revalidatePath(`/officer/cases/${payment.caseId}`);
  revalidatePath("/officer/reports");
  revalidatePath("/client/dashboard");
  revalidatePath(`/client/cases/${payment.caseId}`);
}