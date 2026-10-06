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
        {value === null ||
        value === undefined ||
        value === ""
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
  const colors: Record<string, string> = {
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
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        colors[status] ||
        "bg-gray-100 text-gray-800"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
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

  const caseData = await db.case.findUnique({
    where: {
    id: Number(id),
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
          className="text-sm font-semibold text-blue-600"
        >
          ← Back to Cases
        </Link>

        {/* HEADER */}

        <div className="mt-5 rounded-2xl border bg-white p-6 shadow-sm">

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
              value={caseData.complaintDate}
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
                caseData.previousLegalAssistance
                  ? "Yes"
                  : "No"
              }
            />

            <div className="sm:col-span-2">

              <Field
                label="Previous Assistance Details"
                value={
                  caseData.previousLegalAssistanceDetails
                }
              />

            </div>

          </Section>

          {/* FINANCIAL */}

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

          <section className="rounded-2xl border bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold">
              Documents
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {caseData.nationalIdUrl && (
                <Link
                  href={`/api/officer/cases/${caseData.id}/documents/national-id`}
                  target="_blank"
                  className="rounded-xl bg-gray-900 px-4 py-3 text-center font-semibold text-white hover:bg-gray-800"
                >
                  Preview National ID
                </Link>
              )}

              {caseData.recommendationUrl && (
                <Link
                  href={`/api/officer/cases/${caseData.id}/documents/recommendation`}
                  target="_blank"
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Preview Recommendation
                </Link>
              )}

            </div>

          </section>

          {/* OFFICER COMMENT */}

          <section className="rounded-2xl border bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold">
              Officer Comment
            </h2>

            <div className="mt-4 rounded-xl bg-gray-50 p-4">

              {caseData.officerComment ? (
                <p className="whitespace-pre-wrap text-sm leading-6">
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