"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";

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
export async function submitPayment(formData: FormData) {
  const client = await requireUser("CLIENT");

  if (!client) {
    redirect("/login");
  }

  const caseId = Number(formData.get("caseId"));
  const amountValue = String(
    formData.get("amount") || ""
  ).trim();

  const transactionId = String(
    formData.get("transactionId") || ""
  ).trim();

  const proof = formData.get("proof");

  if (!Number.isInteger(caseId) || caseId <= 0) {
    throw new Error("Valid case ID is required.");
  }

  const amount = Number(amountValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Payment amount must be greater than zero."
    );
  }

  if (!transactionId) {
    throw new Error(
      "Transaction ID is required."
    );
  }

  if (transactionId.length > 200) {
    throw new Error(
      "Transaction ID is too long."
    );
  }

  if (!(proof instanceof File) || proof.size === 0) {
    throw new Error(
      "Proof of payment is required."
    );
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  if (proof.size > MAX_FILE_SIZE) {
    throw new Error(
      "Proof of payment must not exceed 10 MB."
    );
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(proof.type)) {
    throw new Error(
      "Proof must be a PDF, JPG, PNG, or WebP file."
    );
  }

  const existingCase = await db.case.findFirst({
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

  if (!existingCase) {
    throw new Error("Case not found.");
  }

  const assignedFee = Number(
    existingCase.assignedFee ?? 0
  );

  if (assignedFee <= 0) {
    throw new Error(
      "This case has not been charged yet."
    );
  }

  const existingPayments = await db.payment.findMany({
    where: {
      caseId,
      status: "PAID",
    },
    select: {
      amount: true,
    },
  });

  const paidAmount = existingPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount),
    0
  );

  const outstanding = Math.max(
    assignedFee - paidAmount,
    0
  );

  if (amount > outstanding) {
    throw new Error(
      `Payment cannot exceed the outstanding amount of MWK ${outstanding.toLocaleString()}.`
    );
  }

  if (outstanding <= 0) {
    throw new Error(
      "This case has already been fully paid."
    );
  }

  const existingPendingPayment =
    await db.payment.findFirst({
      where: {
        caseId,
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    });

  if (existingPendingPayment) {
    throw new Error(
      "There is already a payment awaiting officer review for this case."
    );
  }

  const safeFileName = proof.name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 150);

  const blob = await put(
    `legal-aid/${client.id}/payments/${caseId}/${Date.now()}-${safeFileName}`,
    proof,
    {
      access: "private",
      addRandomSuffix: true,
      contentType: proof.type,
    }
  );

  const reference = `PAY-${caseId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

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
      proofFileName: proof.name,
      proofUrl: blob.url,
      paymentSubmittedAt: new Date(),
      description: `Payment for case ${existingCase.caseNumber}`,
    },
  });

  revalidatePath("/client/dashboard");
  revalidatePath(`/client/cases/${caseId}`);
  revalidatePath("/officer/dashboard");
  revalidatePath("/officer/reports");

  redirect("/client/dashboard");
}