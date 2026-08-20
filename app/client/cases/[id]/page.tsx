import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientViewCase({
  params,
}: Props) {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const caseId = Number(id);

  if (!Number.isInteger(caseId) || caseId <= 0) {
    notFound();
  }

  const caseItem = await db.case.findFirst({
    where: {
      id: caseId,
      userId: user.id,
    },
  });

  if (!caseItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/client/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>

          <Link
            href={`/client/cases/${caseItem.id}/edit`}
            className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
              caseItem.status === "APPROVED" ||
              caseItem.status === "REJECTED" ||
              caseItem.status === "RESOLVED" ||
              caseItem.status === "CLOSED"
                ? "pointer-events-none bg-gray-200 text-gray-400"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            Edit Case
          </Link>

        </div>

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

              <StatusBadge status={caseItem.status} />

            </div>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* Case type */}
            <section>

              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Case Type
              </h2>

              <p className="mt-2 break-words font-semibold text-gray-900">
                {caseItem.caseType}
              </p>

            </section>

            {/* Description */}
            <section>

              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Your Description
              </h2>

              <div className="mt-2 rounded-xl bg-gray-50 p-4">

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                  {caseItem.description}
                </p>

              </div>

            </section>

            {/* Officer response */}
            <section>

              <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Officer Response
              </h2>

              <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 p-4">

                {caseItem.officerComment ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-blue-900">
                    {caseItem.officerComment}
                  </p>
                ) : (
                  <p className="text-sm text-blue-700">
                    The officer has not added a comment yet.
                  </p>
                )}

              </div>

            </section>

            {/* Consultation */}
            <section>

              <h2 className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Consultation
              </h2>

              <div className="mt-2 rounded-xl border border-green-100 bg-green-50 p-4">

                {caseItem.consultationAt ? (
                  <div>

                    <p className="font-semibold text-green-900">
                      Consultation Scheduled
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-green-800">

                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          caseItem.consultationAt
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
                          caseItem.consultationAt
                        ).toLocaleTimeString("en-MW", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {caseItem.consultationStatus.replaceAll(
                          "_",
                          " "
                        )}
                      </p>

                    </div>

                  </div>
                ) : (
                  <p className="text-sm text-green-700">
                    No consultation has been scheduled yet.
                  </p>
                )}

              </div>

            </section>

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

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    IN_REVIEW: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-indigo-100 text-indigo-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-purple-100 text-purple-700",
    CLOSED: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}