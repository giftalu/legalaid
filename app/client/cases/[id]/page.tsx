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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] ?? "bg-gray-100 text-gray-800"
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
      id:Number(id),
      userId: user.id,
    },
  });

  if (!caseData) {
    notFound();
  }

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

          {/* PAYMENT PLACEHOLDER */}
          <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

            <h2 className="text-lg font-bold text-yellow-900">
              Payments
            </h2>

            <p className="mt-2 text-sm text-yellow-800">
              Payment information will appear here when
              a fee has been assigned to this case.
            </p>

          </section>

        </div>
      </div>
    </main>
  );
}