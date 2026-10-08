"use client";

import { useEffect, useState } from "react";

export default function OfficerReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("ALL");
  const [caseType, setCaseType] = useState("ALL");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (from) {
        params.set("from", from);
      }

      if (to) {
        params.set("to", to);
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (caseType !== "ALL") {
        params.set("caseType", caseType);
      }

      const response = await fetch(
        `/api/officer/reports?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load report"
        );
      }

      setReport(data);
    } catch (err) {
      console.error("REPORT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  function exportCSV() {
    const params = new URLSearchParams();

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    if (status !== "ALL") {
      params.set("status", status);
    }

    if (caseType !== "ALL") {
      params.set("caseType", caseType);
    }

    params.set("format", "csv");

    window.location.href =
      `/api/officer/reports?${params.toString()}`;
  }

  function printReport() {
    window.print();
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">

          <div>
            <h1 className="text-2xl font-bold">
              Reports
            </h1>

            <p className="text-sm text-gray-500">
              Legal Aid case and payment reports
            </p>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={exportCSV}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={printReport}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
            >
              Print / PDF
            </button>

          </div>
        </div>

        {/* Filters */}

        <section className="rounded-xl border bg-white p-5 shadow-sm print:hidden">

          <h2 className="mb-4 text-lg font-semibold">
            Report Filters
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div>
              <label className="mb-1 block text-sm font-medium">
                From
              </label>

              <input
                type="date"
                value={from}
                onChange={(event) =>
                  setFrom(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                To
              </label>

              <input
                type="date"
                value={to}
                onChange={(event) =>
                  setTo(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="IN_REVIEW">
                  In Review
                </option>

                <option value="ASSIGNED">
                  Assigned
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="CLOSED">
                  Closed
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Case Type
              </label>

              <select
                value={caseType}
                onChange={(event) =>
                  setCaseType(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="ALL">
                  All Case Types
                </option>

                <option value="Family">
                  Family
                </option>

                <option value="Land">
                  Land
                </option>

                <option value="Criminal">
                  Criminal
                </option>

                <option value="Civil">
                  Civil
                </option>
              </select>
            </div>

          </div>

          <div className="mt-4">

            <button
              type="button"
              onClick={loadReport}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Generating..."
                : "Generate Report"}
            </button>

          </div>
        </section>

        {/* Error */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Report error:</strong>{" "}
            {error}
          </div>
        )}

        {/* Loading */}

        {loading && !report && !error && (
          <div className="rounded-xl border bg-white p-10 text-center">
            Loading report...
          </div>
        )}

        {/* Report */}

        {report && !loading && (
          <div className="space-y-6">

            {/* Report title */}

            <section className="hidden print:block">
              <h1 className="text-2xl font-bold">
                Legal Aid Management System
              </h1>

              <h2 className="mt-2 text-xl font-semibold">
                Case Report
              </h2>

              <p className="text-sm text-gray-600">
                Generated on{" "}
                {new Date().toLocaleDateString()}
              </p>
            </section>

            {/* Summary */}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryCard
                title="Total Cases"
                value={report.summary?.total ?? 0}
              />

              <SummaryCard
                title="Pending"
                value={report.summary?.pending ?? 0}
              />

              <SummaryCard
                title="Approved"
                value={report.summary?.approved ?? 0}
              />

              <SummaryCard
                title="Rejected"
                value={report.summary?.rejected ?? 0}
              />

              <SummaryCard
                title="In Review"
                value={report.summary?.inReview ?? 0}
              />

              <SummaryCard
                title="In Progress"
                value={report.summary?.inProgress ?? 0}
              />

              <SummaryCard
                title="Resolved"
                value={report.summary?.resolved ?? 0}
              />

              <SummaryCard
                title="Closed"
                value={report.summary?.closed ?? 0}
              />

            </section>

            {/* Payment Summary */}

            <section className="rounded-xl border bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">
                Payment Summary
              </h2>

              <div className="grid gap-4 md:grid-cols-4">

                <MoneyCard
                  title="Total Payments"
                  value={
                    report.summary?.totalPayments ?? 0
                  }
                />

                <MoneyCard
                  title="Paid"
                  value={
                    report.summary?.paidPayments ?? 0
                  }
                />

                <MoneyCard
                  title="Outstanding"
                  value={report.summary?.outstandingPayments ?? 0}
                />

                <MoneyCard
                  title="Failed"
                  value={
                    report.summary?.failedPayments ?? 0
                  }
                />

              </div>

            </section>

            {/* Case Type */}

            <section className="rounded-xl border bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">
                Cases by Type
              </h2>

              {report.byCaseType &&
                Object.keys(report.byCaseType).length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {Object.entries(
                    report.byCaseType
                  ).map(([type, count]) => (

                    <div
                      key={type}
                      className="rounded-lg border bg-gray-50 p-4"
                    >

                      <p className="text-sm text-gray-500">
                        {type}
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {String(count)}
                      </p>

                    </div>

                  ))}

                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No case type data available.
                </p>
              )}

            </section>

            {/* District */}

            <section className="rounded-xl border bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">
                Cases by District
              </h2>

              {report.byDistrict &&
                Object.keys(report.byDistrict).length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {Object.entries(
                    report.byDistrict
                  ).map(([district, count]) => (

                    <div
                      key={district}
                      className="rounded-lg border bg-gray-50 p-4"
                    >

                      <p className="text-sm text-gray-500">
                        {district}
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {String(count)}
                      </p>

                    </div>

                  ))}

                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No district data available.
                </p>
              )}

            </section>

            {/* Case Table */}

            <section className="rounded-xl border bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-lg font-semibold">
                  Case Report
                </h2>

                <span className="text-sm text-gray-500">
                  {report.cases?.length ?? 0} cases
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse text-sm">

                  <thead>

                    <tr className="border-b bg-gray-50 text-left">

                      <th className="p-3">
                        Case Number
                      </th>

                      <th className="p-3">
                        Applicant
                      </th>

                      <th className="p-3">
                        Respondent
                      </th>

                      <th className="p-3">
                        Type
                      </th>

                      <th className="p-3">
                        District
                      </th>

                      <th className="p-3">
                        Status
                      </th>

                      <th className="p-3">
                        Paid
                      </th>

                      <th className="p-3">
                        Outstanding
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {report.cases &&
                      report.cases.length > 0 ? (
                      report.cases.map(
                        (item: any) => (

                          <tr
                            key={item.id}
                            className="border-b"
                          >

                            <td className="p-3 font-medium">
                              {item.caseNumber}
                            </td>

                            <td className="p-3">
                              {item.applicant}
                            </td>

                            <td className="p-3">
                              {item.respondent}
                            </td>

                            <td className="p-3">
                              {item.caseType}
                            </td>

                            <td className="p-3">
                              {item.district || "-"}
                            </td>

                            <td className="p-3">
                              {item.status}
                            </td>

                            <td className="p-3">
                              MWK{" "}
                              {Number(
                                item.paidPayment || 0
                              ).toLocaleString()}
                            </td>

                            <td className="p-3">
                              MWK{" "}
                              {Number(
                                item.outstandingPayment || 0
                              ).toLocaleString()}
                            </td>

                          </tr>

                        )
                      )
                    ) : (
                      <tr>

                        <td
                          colSpan={8}
                          className="p-8 text-center text-gray-500"
                        >
                          No cases found.
                        </td>

                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </div>
        )}

      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}

function MoneyCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold">
        MWK {Number(value).toLocaleString()}
      </p>

    </div>
  );
}