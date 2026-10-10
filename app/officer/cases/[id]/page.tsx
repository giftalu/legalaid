
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

function Field({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-900">
        {value === null || value === undefined || value === ""
          ? "Not provided"
          : String(value)}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    PAID: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-200 text-gray-800",
    REFUNDED: "bg-purple-100 text-purple-800",
    IN_REVIEW: "bg-blue-100 text-blue-800",
    ASSIGNED: "bg-indigo-100 text-indigo-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-purple-100 text-purple-800",
    CLOSED: "bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        colors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleString();
}

function formatAmount(amount: unknown) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return String(amount ?? "0");
  }

  return numericAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function OfficerCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const { id } = await params;
  const caseId = Number(id);

  if (!Number.isSafeInteger(caseId) || caseId <= 0) {
    notFound();
  }

  const caseData = await db.case.findUnique({
    where: {
      id: caseId,
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!caseData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/officer/cases"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to Cases
        </Link>

        {/* HEADER */}

        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Case Number
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {caseData.caseNumber}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Submitted by applicant
              </p>
            </div>

            <StatusBadge status={caseData.status} />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* APPLICANT */}

          <Section title="Applicant Details">
            <Field
              label="Full Name"
              value={caseData.applicantFullName}
            />

            <Field
              label="National ID"
              value={caseData.applicantNationalId}
            />

            <Field
              label="Phone"
              value={caseData.applicantPhone}
            />

            <Field
              label="Email"
              value={caseData.applicantEmail}
            />

            <Field
              label="Address"
              value={caseData.applicantAddress}
            />

            <Field
              label="District"
              value={caseData.applicantDistrict}
            />

            <Field
              label="Traditional Authority"
              value={caseData.applicantTraditionalAuthority}
            />

            <Field
              label="Village"
              value={caseData.applicantVillage}
            />

            <Field
              label="Occupation"
              value={caseData.applicantOccupation}
            />
          </Section>

          {/* RESPONDENT */}

          <Section title="Respondent Details">
            <Field
              label="Name"
              value={caseData.respondentName}
            />

            <Field
              label="Phone"
              value={caseData.respondentPhone}
            />

            <Field
              label="Address"
              value={caseData.respondentAddress}
            />

            <Field
              label="Relationship"
              value={caseData.respondentRelationship}
            />
          </Section>

          {/* COMPLAINT */}

          <Section title="Complaint">
            <Field
              label="Case Type"
              value={caseData.caseType}
            />

            <Field
              label="Complaint Date"
              value={formatDate(caseData.complaintDate)}
            />

            <Field
              label="Incident Location"
              value={caseData.incidentLocation}
            />

            <div className="sm:col-span-2">
              <Field
                label="Description"
                value={caseData.description}
              />
            </div>
          </Section>

          {/* LEGAL AID */}

          <Section title="Legal Aid">
            <div className="sm:col-span-2">
              <Field
                label="Reason for Legal Aid"
                value={caseData.legalAidReason}
              />
            </div>

            <Field
              label="Previous Legal Assistance"
              value={
                caseData.previousLegalAssistance ? "Yes" : "No"
              }
            />

            <div className="sm:col-span-2">
              <Field
                label="Previous Assistance Details"
                value={caseData.previousLegalAssistanceDetails}
              />
            </div>
          </Section>

          {/* FINANCIAL INFORMATION */}

          <Section title="Financial Information">
            <Field
              label="Employment Status"
              value={caseData.employmentStatus}
            />

            <Field
              label="Occupation"
              value={caseData.occupation}
            />

            <Field
              label="Monthly Income"
              value={caseData.monthlyIncome}
            />

            <Field
              label="Other Income"
              value={caseData.otherIncome}
            />

            <Field
              label="Number of Dependants"
              value={caseData.numberOfDependants}
            />

            <div className="sm:col-span-2">
              <Field
                label="Financial Circumstances"
                value={caseData.financialCircumstances}
              />
            </div>
          </Section>

          {/* DOCUMENTS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Documents
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {caseData.nationalIdUrl && (
                <Link
                  href={`/api/officer/cases/${caseData.id}/documents/national-id`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-gray-900 px-4 py-3 text-center font-semibold text-white hover:bg-gray-800"
                >
                  Preview National ID
                </Link>
              )}

              {caseData.recommendationUrl && (
                <Link
                  href={`/api/officer/cases/${caseData.id}/documents/recommendation`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Preview Recommendation
                </Link>
              )}

              {!caseData.nationalIdUrl &&
                !caseData.recommendationUrl && (
                  <p className="text-sm text-gray-500">
                    No documents have been uploaded for this case.
                  </p>
                )}
            </div>
          </section>

          {/* PAYMENTS AND PROOF OF PAYMENT */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Payments &amp; Proof of Payment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review payments submitted for this case.
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {caseData.payments.length}{" "}
                {caseData.payments.length === 1
                  ? "payment"
                  : "payments"}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {caseData.payments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <p className="font-semibold text-gray-700">
                    No payments found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    No payment records are associated with this case yet.
                  </p>
                </div>
              ) : (
                caseData.payments.map((payment) => {
                  const paymentWithProof = payment as typeof payment & {
                    proofUrl?: string | null;
                    proofFileName?: string | null;
                  };

                  const hasProof = Boolean(
                    paymentWithProof.proofUrl ||
                    paymentWithProof.proofFileName
                  );

                  return (
                    <div
                      key={payment.id}
                      className="rounded-xl border border-gray-200 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900">
                            Payment #{payment.id}
                          </h3>

                          <p className="mt-2 break-all text-sm text-gray-600">
                            <span className="font-semibold">
                              Reference:
                            </span>{" "}
                            {payment.reference}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-semibold">
                              Amount:
                            </span>{" "}
                            {payment.currency}{" "}
                            {formatAmount(payment.amount)}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-semibold">
                              Description:
                            </span>{" "}
                            {payment.description || "Not provided"}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-semibold">
                              Submitted:
                            </span>{" "}
                            {formatDate(payment.createdAt)}
                          </p>

                          {payment.paidAt && (
                            <p className="mt-1 text-sm text-gray-600">
                              <span className="font-semibold">
                                Paid at:
                              </span>{" "}
                              {formatDate(payment.paidAt)}
                            </p>
                          )}

                          {payment.providerReference && (
                            <p className="mt-1 break-all text-sm text-gray-600">
                              <span className="font-semibold">
                                Provider reference:
                              </span>{" "}
                              {payment.providerReference}
                            </p>
                          )}
                        </div>

                        <StatusBadge status={payment.status} />
                      </div>

                      <div className="mt-4 border-t border-gray-100 pt-4">
                        {hasProof ? (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                Proof of payment uploaded
                              </p>

                              {paymentWithProof.proofFileName && (
                                <p className="mt-1 break-all text-xs text-gray-500">
                                  {paymentWithProof.proofFileName}
                                </p>
                              )}
                            </div>

                            <Link
                              href={`/api/officer/payments/${payment.id}/proof`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                            >
                              View Payment Proof
                            </Link>
                          </div>
                        ) : (
                          <p className="text-sm text-amber-700">
                            No payment proof is attached to this payment.
                          </p>
                        )}

                        {payment.status === "PENDING" && (
                          <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                            This payment is pending verification. Check
                            the payment details and receipt before
                            confirming it.
                          </p>
                        )}

                        {payment.status === "PAID" && (
                          <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                            This payment is marked as paid.
                          </p>
                        )}

                        {payment.status === "REJECTED" && (
                          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                            This payment has been rejected.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* OFFICER COMMENT */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Officer Comment
            </h2>

            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              {caseData.officerComment ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                  {caseData.officerComment}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  No officer comment yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

