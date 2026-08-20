import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

import DeleteCaseButton from "@/app/officer/components/DeleteCaseButton";
import { logout } from "@/app/login/actions";
import { LogOut, Plus } from "lucide-react";

import {
  updateCaseStatus,
  scheduleConsultation,
  deleteCase,
} from "@/app/officer/actions";


export default async function OfficerDashboard() {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const cases = await db.case.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">

   {/* Header */}
<header className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

    {/* User information */}
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
        {officer.name
          ?.split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Client Portal
        </p>

        <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
          Welcome, {officer.name}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your legal cases and consultations.
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-col gap-2 sm:flex-row">
      <Link
        href="/client/cases/new"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Plus className="h-4 w-4" />
        Register New Case
      </Link>

      <form action={logout}>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </form>
    </div>

  </div>
</header>
        {/* Cases */}
        {cases.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="font-medium text-gray-700">
              No cases have been submitted.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Client cases will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {cases.map((c) => (
              <article
                key={c.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >

                {/* ================================================= */}
                {/* CASE HEADER */}
                {/* ================================================= */}

                <div className="border-b border-gray-200 bg-gray-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Case Number
                      </p>

                      <h2 className="mt-1 break-all text-xl font-bold text-gray-900">
                        {c.caseNumber}
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        Submitted{" "}
                        {new Date(c.createdAt).toLocaleDateString(
                          "en-MW",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <StatusBadge status={c.status} />

                  </div>
                </div>

                <div className="p-5">

                  {/* ================================================= */}
                  {/* CLIENT */}
                  {/* ================================================= */}

                  <div className="rounded-xl border border-gray-200 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Client
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {c.user.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {c.user.email}
                    </p>

                  </div>

                  {/* ================================================= */}
                  {/* CASE INFORMATION */}
                  {/* ================================================= */}

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border border-gray-200 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Case Type
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {c.caseType}
                      </p>

                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Current Status
                      </p>

                      <div className="mt-2">
                        <StatusBadge status={c.status} />
                      </div>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* DESCRIPTION */}
                  {/* ================================================= */}

                  <div className="mt-4 rounded-xl bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Case Description
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {c.description}
                    </p>

                  </div>

                  {/* ================================================= */}
                  {/* CLIENT DOCUMENTS */}
                  {/* ================================================= */}

                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Client Documents
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">

                      {c.nationalIdUrl && (
                        <a
                          href={c.nationalIdUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          View National ID
                        </a>
                      )}

                      {c.recommendationUrl && (
                        <a
                          href={c.recommendationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          View Recommendation
                        </a>
                      )}

                      {!c.nationalIdUrl &&
                        !c.recommendationUrl && (
                          <p className="text-sm text-gray-500">
                            No documents uploaded.
                          </p>
                        )}

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* OFFICER COMMENT */}
                  {/* ================================================= */}

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
                        No comment has been added yet.
                      </p>
                    )}

                  </div>

                  {/* ================================================= */}
                  {/* CONSULTATION */}
                  {/* ================================================= */}

                  <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Consultation
                    </p>

                    {c.consultationAt ? (
                      <div className="mt-3 space-y-1 text-sm text-green-900">

                        <p>
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

                        <p>
                          <strong>Time:</strong>{" "}
                          {new Date(
                            c.consultationAt
                          ).toLocaleTimeString("en-MW", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <p>
                          <strong>Status:</strong>{" "}
                          {c.consultationStatus.replaceAll(
                            "_",
                            " "
                          )}
                        </p>

                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-green-700">
                        No consultation scheduled.
                      </p>
                    )}

                  </div>

                  {/* ================================================= */}
                  {/* OFFICER ACTIONS */}
                  {/* ================================================= */}

                  <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">

                    <h3 className="font-semibold text-gray-900">
                      Case Actions
                    </h3>

                    {/* ============================================= */}
                    {/* APPROVE / REJECT */}
                    {/* ============================================= */}

                    <div className="mt-4">

                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Review Case
                      </p>

                      <form
                        action={updateCaseStatus}
                        className="space-y-3"
                      >

                        <input
                          type="hidden"
                          name="id"
                          value={c.id}
                        />

                        <textarea
                          name="comment"
                          rows={3}
                          placeholder="Enter an officer comment..."
                          defaultValue={
                            c.officerComment ?? ""
                          }
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                          <button
                            type="submit"
                            name="status"
                            value="APPROVED"
                            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Approve Case
                          </button>

                          <button
                            type="submit"
                            name="status"
                            value="REJECTED"
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Reject Case
                          </button>

                        </div>

                      </form>

                    </div>

                    {/* ============================================= */}
                    {/* CONSULTATION SCHEDULING */}
                    {/* ============================================= */}

                    <div className="mt-6 border-t border-gray-200 pt-5">

                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {c.consultationAt
                          ? "Reschedule Consultation"
                          : "Schedule Consultation"}
                      </p>

                      <form
                        action={scheduleConsultation}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end"
                      >

                        <input
                          type="hidden"
                          name="id"
                          value={c.id}
                        />

                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Date
                          </label>

                          <input
                            type="date"
                            name="consultationDate"
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Time
                          </label>

                          <input
                            type="time"
                            name="consultationTime"
                            required
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                          />
                        </div>

                        <button
                          type="submit"
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          {c.consultationAt
                            ? "Reschedule"
                            : "Schedule Consultation"}
                        </button>

                      </form>

                    </div>

                    {/* ============================================= */}
                    {/* CASE MANAGEMENT */}
                    {/* ============================================= */}

                    <div className="mt-6 border-t border-gray-200 pt-5">

                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Manage Case
                      </p>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

                        {/* View */}
                        <Link
                          href={`/officer/cases/${c.id}`}
                          className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          View Case
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/officer/cases/${c.id}/edit`}
                          className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-amber-600"
                        >
                          Edit Case
                        </Link>

                        {/* Delete */}
                        <DeleteCaseButton
                          caseId={c.id}
                          caseNumber={c.caseNumber}
                          deleteAction={deleteCase}
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ??
        "bg-gray-100 text-gray-700"
        }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}