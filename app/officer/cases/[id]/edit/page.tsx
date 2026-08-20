import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { updateCase } from "@/app/officer/actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCasePage({
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
    },
  });

  if (!caseItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Navigation */}
        <div className="mb-6">

          <Link
            href={`/officer/cases/${caseItem.id}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Case
          </Link>

        </div>

        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Header */}
          <div className="border-b border-gray-200 p-5 sm:p-6">

            <h1 className="text-2xl font-bold text-gray-900">
              Edit Case
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {caseItem.caseNumber}
            </p>

          </div>

          <form
            action={updateCase}
            className="space-y-6 p-5 sm:p-6"
          >

            <input
              type="hidden"
              name="id"
              value={caseItem.id}
            />

            {/* Client */}
            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Client
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {caseItem.user.name}
              </p>

              <p className="mt-1 break-all text-sm text-gray-500">
                {caseItem.user.email}
              </p>

            </div>

            {/* Case type */}
            <div>

              <label
                htmlFor="caseType"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Case Type
              </label>

              <input
                id="caseType"
                name="caseType"
                type="text"
                required
                defaultValue={caseItem.caseType}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

            {/* Description */}
            <div>

              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Case Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={8}
                required
                defaultValue={caseItem.description}
                className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

            {/* Status */}
            <div>

              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Case Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={caseItem.status}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
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

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="CLOSED">
                  Closed
                </option>
              </select>

            </div>

            {/* Officer comment */}
            <div>

              <label
                htmlFor="officerComment"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Officer Comment
              </label>

              <textarea
                id="officerComment"
                name="officerComment"
                rows={5}
                defaultValue={
                  caseItem.officerComment ?? ""
                }
                placeholder="Enter officer comment..."
                className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">

              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save Changes
              </button>

              <Link
                href={`/officer/cases/${caseItem.id}`}
                className="flex-1 rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

            </div>

          </form>

        </div>
      </div>
    </main>
  );
}