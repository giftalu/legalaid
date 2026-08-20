import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteClientCase } from "../actions";
import { logout } from "@/app/login/actions";
export default async function ClientDashboard() {
  const user = await requireUser("CLIENT");

  if (!user) {
    redirect("/login");
  }

  const [
    totalCases,
    pendingCases,
    approvedCases,
    rejectedCases,
    inProgressCases,
    scheduledConsultations,
  ] = await Promise.all([
    db.case.count({
      where: {
        userId: user.id,
      },
    }),

    db.case.count({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    }),

    db.case.count({
      where: {
        userId: user.id,
        status: "APPROVED",
      },
    }),

    db.case.count({
      where: {
        userId: user.id,
        status: "REJECTED",
      },
    }),

    db.case.count({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
      },
    }),

    db.case.count({
      where: {
        userId: user.id,
        consultationStatus: "SCHEDULED",
      },
    }),
  ]);

  const cases = await db.case.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Client Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Welcome, {user.name}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <Link
              href="/client/cases/new"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Register New Case
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>

          </div>
        </div>

        {/* ===================================================== */}
        {/* CASE COUNTERS */}
        {/* ===================================================== */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Case Overview
            </h2>

            <p className="text-sm text-gray-500">
              Summary of your legal cases.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

            <CounterCard
              title="Total"
              count={totalCases}
              className="border-gray-200 bg-white"
              textClass="text-gray-900"
            />

            <CounterCard
              title="Pending"
              count={pendingCases}
              className="border-yellow-200 bg-yellow-50"
              textClass="text-yellow-700"
            />

            <CounterCard
              title="Approved"
              count={approvedCases}
              className="border-green-200 bg-green-50"
              textClass="text-green-700"
            />

            <CounterCard
              title="Rejected"
              count={rejectedCases}
              className="border-red-200 bg-red-50"
              textClass="text-red-700"
            />

            <CounterCard
              title="In Progress"
              count={inProgressCases}
              className="border-blue-200 bg-blue-50"
              textClass="text-blue-700"
            />

            <CounterCard
              title="Consultations"
              count={scheduledConsultations}
              className="border-purple-200 bg-purple-50"
              textClass="text-purple-700"
            />

          </div>
        </section>

        {/* ===================================================== */}
        {/* CASES */}
        {/* ===================================================== */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              My Cases
            </h2>

            <p className="text-sm text-gray-500">
              View the progress and communication for your cases.
            </p>
          </div>

          {cases.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                No cases yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                You have not submitted any legal cases yet.
              </p>

              <Link
                href="/client/cases/new"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Register a Case
              </Link>
            </div>
          ) : (
            <div className="space-y-5">

              {cases.map((c) => (
                <article
                  key={c.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >

                  {/* Header */}
                  <div className="border-b border-gray-200 bg-gray-50 p-4 sm:p-5">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Case Number
                        </p>

                        <h3 className="mt-1 break-all text-lg font-bold text-gray-900">
                          {c.caseNumber}
                        </h3>
                      </div>

                      <StatusBadge status={c.status} />

                    </div>

                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Case Type
                        </p>

                        <p className="mt-2 font-semibold text-gray-900">
                          {c.caseType}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Submitted
                        </p>

                        <p className="mt-2 text-sm text-gray-700">
                          {new Date(
                            c.createdAt
                          ).toLocaleDateString("en-MW", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                    </div>

                    {/* Description */}
                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Your Description
                      </p>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                        {c.description}
                      </p>
                    </div>

                    {/* Officer Comment */}
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Officer Comment
                      </p>

                      {c.officerComment ? (
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-blue-900">
                          {c.officerComment}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-blue-700">
                          No comment from the officer yet.
                        </p>
                      )}

                    </div>

                    {/* Consultation */}
                    <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                        Consultation
                      </p>

                      {c.consultationAt ? (
                        <div className="mt-2">

                          <p className="font-semibold text-green-900">
                            Consultation Scheduled
                          </p>

                          <p className="mt-2 text-sm text-green-800">
                            <strong>Date:</strong>{" "}
                            {new Date(
                              c.consultationAt
                            ).toLocaleDateString("en-MW", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>

                          <p className="text-sm text-green-800">
                            <strong>Time:</strong>{" "}
                            {new Date(
                              c.consultationAt
                            ).toLocaleTimeString("en-MW", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>

                          <p className="mt-1 text-xs font-semibold uppercase text-green-700">
                            {c.consultationStatus.replaceAll(
                              "_",
                              " "
                            )}
                          </p>

                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-green-700">
                          No consultation has been scheduled yet.
                        </p>
                      )}

                    </div>

                    {/* Documents */}
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Documents
                      </p>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">

                        {c.nationalIdUrl && (
                          <a
                            href={c.nationalIdUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-gray-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-gray-800"
                          >
                            View National ID
                          </a>
                        )}

                        {c.recommendationUrl && (
                          <a
                            href={c.recommendationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            View Recommendation
                          </a>
                        )}

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">

                      <Link
                        href={`/client/cases/${c.id}`}
                        className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        View Case
                      </Link>

                      <Link
                        href={`/client/cases/${c.id}/edit`}
                        className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${c.status === "APPROVED" ||
                          c.status === "REJECTED" ||
                          c.status === "RESOLVED" ||
                          c.status === "CLOSED"
                          ? "pointer-events-none bg-gray-200 text-gray-400"
                          : "bg-amber-500 text-white hover:bg-amber-600"
                          }`}
                      >
                        Edit Case
                      </Link>

                      <form action={deleteClientCase}>
                        <input
                          type="hidden"
                          name="id"
                          value={c.id}
                        />

                        <button
                          type="submit"
                          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete Case
                        </button>
                      </form>

                    </div>

                  </div>
                </article>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

/* ========================================================= */
/* COUNTER CARD */
/* ========================================================= */

function CounterCard({
  title,
  count,
  className,
  textClass,
}: {
  title: string;
  count: number;
  className: string;
  textClass: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${textClass}`}
      >
        {count}
      </p>
    </div>
  );
}

/* ========================================================= */
/* STATUS BADGE */
/* ========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-700",

    APPROVED:
      "bg-green-100 text-green-700",

    REJECTED:
      "bg-red-100 text-red-700",

    IN_REVIEW:
      "bg-blue-100 text-blue-700",

    ASSIGNED:
      "bg-indigo-100 text-indigo-700",

    IN_PROGRESS:
      "bg-blue-100 text-blue-700",

    RESOLVED:
      "bg-purple-100 text-purple-700",

    CLOSED:
      "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ||
        "bg-gray-100 text-gray-700"
        }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}