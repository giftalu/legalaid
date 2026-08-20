import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ViewCasePage({
  params,
}: Props) {
  const user = await requireUser("OFFICER");

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const caseId = Number(id);

  if (!Number.isInteger(caseId) || caseId <= 0) {
    notFound();
  }

  const caseItem = await db.case.findUnique({
    where: {
      id: caseId,
    },
    include: {
      user: true,
      reviewedBy: true,
    },
  });

  if (!caseItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Top navigation */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/officer/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>

          <Link
            href={`/officer/cases/${caseItem.id}/edit`}
            className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-amber-600"
          >
            Edit Case
          </Link>

        </div>

        {/* Case */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 p-5 sm:p-6">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Case Number
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <h1 className="break-all text-2xl font-bold text-gray-900">
                {caseItem.caseNumber}
              </h1>

              <span
                className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                  caseItem.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : caseItem.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {caseItem.status.replaceAll("_", " ")}
              </span>

            </div>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* Client */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Client
              </h2>

              <div className="mt-3 rounded-xl border border-gray-200 p-4">

                <p className="font-semibold text-gray-900">
                  {caseItem.user.name}
                </p>

                <p className="mt-1 break-all text-sm text-gray-500">
                  {caseItem.user.email}
                </p>

              </div>
            </section>

            {/* Case type */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Case Type
              </h2>

              <p className="mt-2 break-words text-gray-900">
                {caseItem.caseType}
              </p>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Description
              </h2>

              <div className="mt-2 rounded-xl bg-gray-50 p-4">

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                  {caseItem.description}
                </p>

              </div>
            </section>

            {/* Officer comment */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Officer Comment
              </h2>

              <div className="mt-2 rounded-xl bg-gray-50 p-4">

                {caseItem.officerComment ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                    {caseItem.officerComment}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    No officer comment.
                  </p>
                )}

              </div>
            </section>

            {/* Consultation */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Consultation
              </h2>

              <div className="mt-2 rounded-xl bg-blue-50 p-4">

                {caseItem.consultationAt ? (
                  <>
                    <p className="font-semibold text-blue-900">
                      Consultation Scheduled
                    </p>

                    <p className="mt-2 text-sm text-blue-800">
                      {new Date(
                        caseItem.consultationAt
                      ).toLocaleDateString("en-MW", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    <p className="mt-1 text-sm text-blue-800">
                      {new Date(
                        caseItem.consultationAt
                      ).toLocaleTimeString("en-MW", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase text-blue-600">
                      {caseItem.consultationStatus.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    No consultation scheduled.
                  </p>
                )}

              </div>
            </section>

            {/* Review information */}
            {caseItem.reviewedBy && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Reviewed By
                </h2>

                <div className="mt-2 rounded-xl border border-gray-200 p-4">

                  <p className="font-medium text-gray-900">
                    {caseItem.reviewedBy.name}
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    {caseItem.reviewedBy.email}
                  </p>

                </div>
              </section>
            )}

            {/* Dates */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Submitted
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  {new Date(
                    caseItem.createdAt
                  ).toLocaleString("en-MW")}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Last Updated
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  {new Date(
                    caseItem.updatedAt
                  ).toLocaleString("en-MW")}
                </p>
              </div>

            </section>

          </div>
        </div>

      </div>
    </main>
  );
}