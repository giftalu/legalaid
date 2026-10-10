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
/**
 * Client submits proof of payment
 */

/**
 * Client submits proof of payment.
 *
 * PaymentProofForm uploads the document to Vercel Blob first.
 * This action validates the uploaded URL and saves the payment.
 */
export async function submitPayment(formData: FormData) {
  const client = await requireUser("CLIENT");

  if (!client) {
    redirect("/login");
  }

  const rawCaseId = formData.get("caseId");
  const caseId = Number(rawCaseId);

  const amountValue = String(
    formData.get("amount") ?? ""
  ).trim();

  const transactionId = String(
    formData.get("transactionId") ?? ""
  ).trim();

  const rawProofUrl = formData.get("proofUrl");
  const rawProofFileName = formData.get("proofFileName");

  // Validate case ID.
  if (
    typeof rawCaseId !== "string" ||
    !Number.isInteger(caseId) ||
    caseId <= 0
  ) {
    throw new Error("Valid case ID is required.");
  }

  // Validate amount.
  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Payment amount must be greater than zero."
    );
  }

  // Validate transaction reference.
  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  if (transactionId.length > 200) {
    throw new Error("Transaction ID is too long.");
  }

  // Validate uploaded proof details.
  if (
    typeof rawProofUrl !== "string" ||
    !rawProofUrl.trim()
  ) {
    throw new Error(
      "Please upload your proof of payment."
    );
  }

  if (
    typeof rawProofFileName !== "string" ||
    !rawProofFileName.trim()
  ) {
    throw new Error(
      "Proof of payment filename is missing."
    );
  }

  const proofFileName = rawProofFileName.trim();

  if (
    proofFileName.length > 255 ||
    /[/\\\u0000-\u001F]/.test(proofFileName)
  ) {
    throw new Error("Invalid proof of payment filename.");
  }

  // Validate the storage URL.
  let proofUrl: URL;

  try {
    proofUrl = new URL(rawProofUrl);
  } catch {
    throw new Error("Invalid proof of payment URL.");
  }

  if (
    proofUrl.protocol !== "https:" ||
    proofUrl.username ||
    proofUrl.password ||
    proofUrl.port ||
    !proofUrl.hostname.endsWith(
      ".blob.vercel-storage.com"
    )
  ) {
    throw new Error(
      "Invalid document storage URL."
    );
  }

  // Confirm that the uploaded document belongs to this
  // client's case. The upload endpoint must use this path.
  const expectedPath =
    `/legal-aid/${client.id}/payments/${caseId}/`;

  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(proofUrl.pathname);
  } catch {
    throw new Error("Invalid proof of payment URL.");
  }

  if (!decodedPath.startsWith(expectedPath)) {
    throw new Error(
      "The uploaded proof does not belong to this case."
    );
  }

  // Confirm ownership of the case.
  const caseItem = await db.case.findFirst({
    where: {
      id: caseId,
      userId: client.id,
    },
    select: {
      id: true,
      caseNumber: true,
      assignedFee: true,
    },
  });

  if (!caseItem) {
    throw new Error("Case not found.");
  }

  const assignedFee = Number(
    caseItem.assignedFee ?? 0
  );

  if (
    !Number.isFinite(assignedFee) ||
    assignedFee <= 0
  ) {
    throw new Error(
      "This case has not been charged yet."
    );
  }

  // Calculate the amount already paid.
  const paidPayments = await db.payment.findMany({
    where: {
      caseId,
      userId: client.id,
      status: "PAID",
    },
    select: {
      amount: true,
    },
  });

  const paidAmount = paidPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const outstanding = Math.max(
    assignedFee - paidAmount,
    0
  );

  if (outstanding <= 0) {
    throw new Error(
      "This case has already been fully paid."
    );
  }

  if (amount > outstanding) {
    throw new Error(
      `Payment cannot exceed the outstanding amount of MWK ${outstanding.toLocaleString()}.`
    );
  }

  // Prevent duplicate pending payment submissions.
  const pendingPayment = await db.payment.findFirst({
    where: {
      caseId,
      userId: client.id,
      status: {
        in: ["PENDING", "PROCESSING"],
      },
    },
    select: {
      id: true,
    },
  });

  if (pendingPayment) {
    throw new Error(
      "There is already a payment awaiting officer review for this case."
    );
  }

  const reference =
    `PAY-${caseId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

  // The file has already been uploaded.
  // Do not upload it again in this server action.
  await db.payment.create({
    data: {
      caseId,
      userId: client.id,
      amount,
      currency: "MWK",
      status: "PENDING",
      reference,
      provider: "MANUAL",
      providerReference: transactionId,
      transactionId,
      proofFileName,
      proofUrl: proofUrl.href,
      paymentSubmittedAt: new Date(),
      description: `Payment for case ${caseItem.caseNumber}`,
    },
  });

  revalidatePath("/client/dashboard");
  revalidatePath(`/client/cases/${caseId}`);
  revalidatePath("/officer/dashboard");
  revalidatePath("/officer/reports");

  redirect(`/client/cases/${caseId}`);
}
