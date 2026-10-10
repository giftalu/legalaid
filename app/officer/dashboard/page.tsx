
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import DeleteCaseButton from "@/app/officer/components/DeleteCaseButton";
import { logout } from "@/app/login/actions";

import {
  updateCaseStatus,
  scheduleConsultation,
  deleteCase,
  chargeCase,
} from "@/app/officer/actions";

type DashboardSearchParams = {
  from?: string | string[];
  to?: string | string[];
  caseType?: string | string[];
};

type OfficerDashboardProps = {
  searchParams: Promise<DashboardSearchParams>;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MALAWI_UTC_OFFSET_MS = 2 * 60 * 60 * 1000;

function getSingleValue(
  value: string | string[] | undefined
): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Accepts only real dates in YYYY-MM-DD format.
 */
function parseDate(
  value: string | string[] | undefined
): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

/**
 * Converts a selected Malawi calendar date into its UTC boundary.
 *
 * Malawi uses UTC+2. For example, midnight on 10 October in Malawi
 * is 22:00 UTC on 9 October.
 */
function malawiDateBoundary(
  date: Date,
  dayOffset = 0
): Date {
  return new Date(
    date.getTime() +
      dayOffset * DAY_MS -
      MALAWI_UTC_OFFSET_MS
  );
}

export default async function OfficerDashboard({
  searchParams,
}: OfficerDashboardProps) {
  const officer = await requireUser("OFFICER");

  if (!officer) {
    redirect("/login");
  }

  const params = await searchParams;

  const fromValue = getSingleValue(params.from);
  const toValue = getSingleValue(params.to);
  const caseTypeValue = getSingleValue(params.caseType);

  const fromDate = parseDate(fromValue);
  const toDate = parseDate(toValue);

  const validDateRange =
    (!fromValue || fromDate !== null) &&
    (!toValue || toDate !== null) &&
    (!fromDate ||
      !toDate ||
      fromDate.getTime() <= toDate.getTime());

  /*
   * Build the Prisma filter.
   *
   * createdAt uses inclusive Malawi calendar dates:
   * - From date: midnight on that date, Malawi time.
   * - To date: midnight on the following date, Malawi time,
   *   exclusive, so the selected end date is fully included.
   *
   * If the date range is invalid, date filtering is ignored.
   * A valid case-type filter can still be applied.
   */
  const caseWhere = {
    ...(validDateRange && (fromDate || toDate)
      ? {
          createdAt: {
            ...(fromDate
              ? {
                  gte: malawiDateBoundary(fromDate),
                }
              : {}),
            ...(toDate
              ? {
                  lt: malawiDateBoundary(toDate, 1),
                }
              : {}),
          },
        }
      : {}),
    ...(caseTypeValue
      ? {
          caseType: caseTypeValue,
        }
      : {}),
  };

  const [
    totalCases,
    pendingCases,
    approvedCases,
    rejectedCases,
    inProgressCases,
    scheduledConsultations,
    resolvedCases,
    closedCases,
    cases,
    caseTypes,
  ] = await Promise.all([
    // Global counters are intentionally unaffected by filters.
    db.case.count(),

    db.case.count({
      where: { status: "PENDING" },
    }),

    db.case.count({
      where: { status: "APPROVED" },
    }),

    db.case.count({
      where: { status: "REJECTED" },
    }),

    db.case.count({
      where: { status: "IN_PROGRESS" },
    }),

    db.case.count({
      where: { consultationStatus: "SCHEDULED" },
    }),

    db.case.count({
      where: { status: "RESOLVED" },
    }),

    db.case.count({
      where: { status: "CLOSED" },
    }),

    // This is the only query affected by the selected filters.
    db.case.findMany({
      where: caseWhere,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Get existing case types for the dropdown.
    db.case.findMany({
      select: {
        caseType: true,
      },
      distinct: ["caseType"],
      orderBy: {
        caseType: "asc",
      },
    }),
  ]);

  const availableCaseTypes = caseTypes
    .map((item) => item.caseType)
    .filter(
      (type): type is string =>
        typeof type === "string" && type.length > 0
    );

  // Keep a selected URL value visible even if no current case
  // has that value.
  const dropdownCaseTypes = Array.from(
    new Set([
      ...availableCaseTypes,
      ...(caseTypeValue ? [caseTypeValue] : []),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const hasActiveFilters = Boolean(
    fromValue || toValue || caseTypeValue
  );

  const hasValidDateInput =
    (!fromValue || fromDate !== null) &&
    (!toValue || toDate !== null);

  const hasInvalidDateRange =
    !hasValidDateInput ||
    (fromDate !== null &&
      toDate !== null &&
      fromDate.getTime() > toDate.getTime());

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* HEADER */}
        <header className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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
                  Officer Portal
                </p>

                <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                  Welcome, {officer.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your legal cases and consultations.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/officer/reports"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                Reports
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

        {/* CASE COUNTERS */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Case Overview
            </h2>

            <p className="text-sm text-gray-500">
              Current status of all client cases. These totals are not
              affected by the filters below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
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

            <CounterCard
              title="Resolved"
              count={resolvedCases}
              className="border-indigo-200 bg-indigo-50"
              textClass="text-indigo-700"
            />

            <CounterCard
              title="Closed"
              count={closedCases}
              className="border-gray-200 bg-gray-100"
              textClass="text-gray-700"
            />
          </div>
        </section>

        {/* FILTERS */}
        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Filter Cases
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Filter cases by submission date and case type. You can
              combine all three filters.
            </p>
          </div>

          <form
            method="GET"
            action="/officer/dashboard"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          >
            <div>
              <label
                htmlFor="from"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                From Date
              </label>

              <input
                id="from"
                type="date"
                name="from"
                defaultValue={fromValue}
                max={toValue || undefined}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="to"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                To Date
              </label>

              <input
                id="to"
                type="date"
                name="to"
                defaultValue={toValue}
                min={fromValue || undefined}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="caseType"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Case Type
              </label>

              <select
                id="caseType"
                name="caseType"
                defaultValue={caseTypeValue}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All case types</option>

                {dropdownCaseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>

              <Link
                href="/officer/dashboard"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Clear
              </Link>
            </div>
          </form>

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-600">
                Active filters:
              </span>

              {fromValue && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  From: {fromValue}
                </span>
              )}

              {toValue && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  To: {toValue}
                </span>
              )}

              {caseTypeValue && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Type: {caseTypeValue.replaceAll("_", " ")}
                </span>
              )}

              {hasInvalidDateRange && (
                <p className="w-full text-sm font-medium text-red-600">
                  The date range is invalid. Select valid dates and
                  ensure the From Date is not later than the To Date.
                  Date filtering is temporarily ignored until corrected.
                </p>
              )}
            </div>
          )}
        </section>

        {/* CASE LIST */}
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Client Cases
              </h2>

              <p className="text-sm text-gray-500">
                {cases.length}{" "}
                {cases.length === 1 ? "case" : "cases"} found
                {hasActiveFilters ? " for the selected filters." : "."}
              </p>
            </div>
          </div>

          {cases.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="font-medium text-gray-700">
                {hasActiveFilters
                  ? "No cases match your selected filters."
                  : "No cases have been submitted."}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? "Try changing the dates or selecting a different case type."
                  : "Client cases will appear here."}
              </p>

              {hasActiveFilters && (
                <Link
                  href="/officer/dashboard"
                  className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Show All Cases
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {cases.map((c) => (
                <article
                  key={c.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* CASE HEADER */}
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
                              timeZone: "Africa/Blantyre",
                            }
                          )}
                        </p>
                      </div>

                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <div className="p-5">
                    {/* CLIENT */}
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

                    {/* CASE INFORMATION */}
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

                    {/* DESCRIPTION */}
                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Case Description
                      </p>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                        {c.description}
                      </p>
                    </div>

                    {/* CLIENT DOCUMENTS */}
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Client Documents
                      </p>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        {c.nationalIdUrl && (
                          <Link
                            href={`/officer/cases/${c.id}/documents/national-id`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                          >
                            View National ID
                          </Link>
                        )}

                        {c.recommendationUrl && (
                          <Link
                            href={`/officer/cases/${c.id}/documents/recommendation`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            View Recommendation
                          </Link>
                        )}

                        {!c.nationalIdUrl &&
                          !c.recommendationUrl && (
                            <p className="text-sm text-gray-500">
                              No documents uploaded.
                            </p>
                          )}
                      </div>
                    </div>

                    {/* OFFICER COMMENT */}
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

                    {/* CONSULTATION */}
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
                              timeZone: "Africa/Blantyre",
                            })}
                          </p>

                          <p>
                            <strong>Time:</strong>{" "}
                            {new Date(
                              c.consultationAt
                            ).toLocaleTimeString("en-MW", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Africa/Blantyre",
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

                    {/* OFFICER ACTIONS */}
                    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
                      <h3 className="font-semibold text-gray-900">
                        Case Actions
                      </h3>

                      {/* APPROVE / REJECT */}
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
                            defaultValue={c.officerComment ?? ""}
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

                      {/* CONSULTATION SCHEDULING */}
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
                            <label
                              htmlFor={`consultation-date-${c.id}`}
                              className="mb-1 block text-xs font-medium text-gray-600"
                            >
                              Date
                            </label>

                            <input
                              id={`consultation-date-${c.id}`}
                              type="date"
                              name="consultationDate"
                              required
                              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`consultation-time-${c.id}`}
                              className="mb-1 block text-xs font-medium text-gray-600"
                            >
                              Time
                            </label>

                            <input
                              id={`consultation-time-${c.id}`}
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

                      {/* CASE CHARGING */}
                      <div className="mt-6 border-t border-gray-200 pt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Case Charging
                        </p>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900">
                              Assign / Update Case Fee
                            </h4>

                            <p className="mt-1 text-sm text-gray-600">
                              Set the amount the client is required to
                              pay for this case.
                            </p>
                          </div>

                          {c.assignedFee !== null &&
                            c.assignedFee !== undefined && (
                              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-lg border border-amber-200 bg-white p-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Assigned Fee
                                  </p>

                                  <p className="mt-1 text-lg font-bold text-gray-900">
                                    MWK{" "}
                                    {Number(
                                      c.assignedFee
                                    ).toLocaleString("en-MW")}
                                  </p>
                                </div>

                                <div className="rounded-lg border border-amber-200 bg-white p-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Description
                                  </p>

                                  <p className="mt-1 text-sm text-gray-700">
                                    {c.feeDescription ||
                                      "No description provided"}
                                  </p>
                                </div>

                                <div className="rounded-lg border border-amber-200 bg-white p-3">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Charged On
                                  </p>

                                  <p className="mt-1 text-sm text-gray-700">
                                    {c.feeAssignedAt
                                      ? new Date(
                                          c.feeAssignedAt
                                        ).toLocaleDateString(
                                          "en-MW",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            timeZone:
                                              "Africa/Blantyre",
                                          }
                                        )
                                      : "Not recorded"}
                                  </p>
                                </div>
                              </div>
                            )}

                          <form
                            action={chargeCase}
                            className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end"
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={c.id}
                            />

                            <div>
                              <label
                                htmlFor={`amount-${c.id}`}
                                className="mb-1 block text-xs font-medium text-gray-700"
                              >
                                Amount (MWK)
                              </label>

                              <input
                                id={`amount-${c.id}`}
                                type="number"
                                name="amount"
                                min="1"
                                step="0.01"
                                required
                                defaultValue={
                                  c.assignedFee !== null &&
                                  c.assignedFee !== undefined
                                    ? Number(c.assignedFee)
                                    : ""
                                }
                                placeholder="Enter amount"
                                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`description-${c.id}`}
                                className="mb-1 block text-xs font-medium text-gray-700"
                              >
                                Charge Description
                              </label>

                              <input
                                id={`description-${c.id}`}
                                type="text"
                                name="description"
                                maxLength={500}
                                defaultValue={c.feeDescription ?? ""}
                                placeholder="e.g. Legal consultation fee"
                                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <button
                              type="submit"
                              className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                            >
                              {c.assignedFee !== null &&
                              c.assignedFee !== undefined
                                ? "Update Charge"
                                : "Charge Case"}
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* CASE MANAGEMENT */}
                      <div className="mt-6 border-t border-gray-200 pt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Manage Case
                        </p>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <Link
                            href={`/officer/cases/${c.id}`}
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
                          >
                            View Case
                          </Link>

                          <Link
                            href={`/officer/cases/${c.id}/edit`}
                            className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-amber-600"
                          >
                            Edit Case
                          </Link>

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
        </section>
      </div>
    </main>
  );
}

/* STATUS BADGE */
function StatusBadge({ status }: { status: string }) {
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

/* COUNTER CARD */
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
    <div className={`rounded-2xl border p-4 shadow-sm ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className={`mt-2 text-3xl font-bold ${textClass}`}>
        {count}
      </p>
    </div>
  );
}
