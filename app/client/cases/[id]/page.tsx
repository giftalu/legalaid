import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitPayment } from "@/app/client/actions";
import PaymentProofForm from "./PaymentProofForm";
function Field({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  const text =
    value === null ||
      value === undefined ||
      value === ""
      ? "Not provided"
      : String(value);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-900">
        {text}
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
      <h2 className="text-lg font-bold text-gray-900">
        {title}
      </h2>

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
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    IN_REVIEW: "bg-blue-100 text-blue-800",
    ASSIGNED: "bg-indigo-100 text-indigo-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-purple-100 text-purple-800",
    CLOSED: "bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status] ?? "bg-gray-100 text-gray-800"
        }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function ClientCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const caseData = await db.case.findFirst({
    where: {
      id: Number(id),
      userId: user.id,
    },
  });

  if (!caseData) {
    notFound();
  }
  const payments = await db.payment.findMany({
    where: {
      caseId: caseData.id,
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      reference: true,
      transactionId: true,
      proofFileName: true,
      paymentSubmittedAt: true,
      paymentReviewedAt: true,
      description: true,
    },
  });

  const assignedFee = Number(caseData.assignedFee ?? 0);

  const paidAmount = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const outstanding = Math.max(assignedFee - paidAmount, 0);

  const pendingPayment = payments.some(
    (payment) =>
      payment.status === "PENDING" ||
      payment.status === "PROCESSING"
  );
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <Link
            href="/client/dashboard"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* HEADER */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Case Number
              </p>

              <h1 className="mt-1 break-all text-2xl font-bold text-gray-900">
                {caseData.caseNumber}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Submitted{" "}
                {new Date(
                  caseData.createdAt
                ).toLocaleDateString("en-MW", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <StatusBadge status={caseData.status} />

          </div>
        </div>

        <div className="mt-6 space-y-6">

          {/* APPLICANT */}
          <Section title="1. Applicant Details">

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
          <Section title="2. Respondent Details">

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
              label="Relationship to Applicant"
              value={caseData.respondentRelationship}
            />

          </Section>

          {/* COMPLAINT */}
          <Section title="3. Complaint Details">

            <Field
              label="Case Type"
              value={caseData.caseType}
            />

            <Field
              label="Incident Date"
              value={caseData.complaintDate}
            />

            <Field
              label="Incident Location"
              value={caseData.incidentLocation}
            />

            <div className="sm:col-span-2">
              <Field
                label="Detailed Complaint"
                value={caseData.description}
              />
            </div>

          </Section>

          {/* LEGAL AID */}
          <Section title="4. Legal Aid">

            <div className="sm:col-span-2">
              <Field
                label="Reason for Requesting Legal Aid"
                value={caseData.legalAidReason}
              />
            </div>

            <Field
              label="Previous Legal Assistance"
              value={
                caseData.previousLegalAssistance
                  ? "Yes"
                  : "No"
              }
            />

            <div className="sm:col-span-2">
              <Field
                label="Previous Legal Assistance Details"
                value={
                  caseData.previousLegalAssistanceDetails
                }
              />
            </div>

          </Section>

          {/* FINANCIAL */}
          <Section title="5. Financial Information">

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

          {/* OFFICER */}
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

            <h2 className="text-lg font-bold text-blue-900">
              Officer Communication
            </h2>

            <div className="mt-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Officer Comment
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">
                {caseData.officerComment ||
                  "No officer comment has been added yet."}
              </p>

            </div>

          </section>

          {/* CONSULTATION */}
          <section className="rounded-2xl border border-green-200 bg-green-50 p-5">

            <h2 className="text-lg font-bold text-green-900">
              Consultation
            </h2>

            {caseData.consultationAt ? (
              <div className="mt-4 space-y-2 text-sm text-green-900">

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    caseData.consultationAt
                  ).toLocaleDateString("en-MW", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(
                    caseData.consultationAt
                  ).toLocaleTimeString("en-MW", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {caseData.consultationStatus.replaceAll(
                    "_",
                    " "
                  )}
                </p>

              </div>
            ) : (
              <p className="mt-3 text-sm text-green-800">
                No consultation has been scheduled yet.
              </p>
            )}

          </section>

          {/* DOCUMENTS */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold text-gray-900">
              Supporting Documents
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Open documents in the secure preview page.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {caseData.nationalIdUrl && (
                <Link
                  href={`/api/client/cases/${caseData.id}/documents/national-id`}
                  target="_blank"
                  className="rounded-xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Preview National ID
                </Link>
              )}

              {caseData.recommendationUrl && (
                <Link
                  href={`/api/client/cases/${caseData.id}/documents/recommendation`}
                  target="_blank"
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Preview Recommendation Letter
                </Link>
              )}

            </div>

          </section>

          {/* PAYMENTS */}
          <section className="rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              6. Payments
            </h2>

            {caseData.assignedFee === null ||
              caseData.assignedFee === undefined ||
              assignedFee <= 0 ? (
              <p className="mt-3 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                No fee has been assigned to this case yet. You will be able to
                submit payment after the Legal Aid Officer assigns a fee.
              </p>
            ) : (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Assigned Fee
                    </p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                      MWK {assignedFee.toLocaleString("en-MW", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase text-green-700">
                      Amount Paid
                    </p>
                    <p className="mt-2 text-xl font-bold text-green-800">
                      MWK {paidAmount.toLocaleString("en-MW", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase text-blue-700">
                      Outstanding Balance
                    </p>
                    <p className="mt-2 text-xl font-bold text-blue-800">
                      MWK {outstanding.toLocaleString("en-MW", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-bold text-gray-900">
                    Payment History
                  </h3>

                  {payments.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                      You have not submitted any payments for this case.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                MWK {Number(payment.amount).toLocaleString("en-MW", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>

                              <p className="mt-1 break-all text-sm text-gray-600">
                                Payment reference: {payment.reference}
                              </p>

                              <p className="mt-1 break-all text-sm text-gray-600">
                                Transaction ID: {payment.transactionId || "Not provided"}
                              </p>

                              <p className="mt-1 break-words text-sm text-gray-600">
                                Proof: {payment.proofFileName || "No file recorded"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Submitted: {payment.paymentSubmittedAt
                                  ? new Date(payment.paymentSubmittedAt).toLocaleString("en-MW")
                                  : new Date().toLocaleString("en-MW")}
                              </p>

                              {payment.paymentReviewedAt && (
                                <p className="mt-1 text-sm text-gray-500">
                                  Reviewed: {new Date(payment.paymentReviewedAt).toLocaleString("en-MW")}
                                </p>
                              )}

                              {payment.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                  {payment.description}
                                </p>
                              )}
                            </div>

                            <span
                              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${payment.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "FAILED" ||
                                  payment.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : payment.status === "PROCESSING"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {payment.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {outstanding > 0 && (
                  <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <h3 className="font-bold text-blue-900">
                      Submit Proof of Payment
                    </h3>

                    <p className="mt-1 text-sm text-blue-800">
                      Enter the amount you paid, your transaction ID, and upload
                      your deposit slip or payment confirmation. Your payment will
                      remain pending until an officer reviews it.
                    </p>

                    {pendingPayment ? (
                      <p className="mt-4 rounded-lg bg-white p-3 text-sm text-amber-800">
                        You already have a payment awaiting review. Please wait
                        for the officer to review it before submitting another payment.
                      </p>
                    ) : (
                      <PaymentProofForm
                        caseId={caseData.id}
                        clientId={user.id}
                        outstanding={outstanding}
                      />
                    )}
                  </div>
                )}

                {outstanding <= 0 && (
                  <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800">
                    This case has been fully paid according to the recorded
                    approved payments.
                  </p>
                )}
              </>
            )}
          </section>


        </div>
      </div>
    </main>
  );
}