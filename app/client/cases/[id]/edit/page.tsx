import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateClientCase } from "@/app/client/cases/actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditClientCase({
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

  const lockedStatuses = [
    "APPROVED",
    "REJECTED",
    "RESOLVED",
    "CLOSED",
  ];

  if (lockedStatuses.includes(caseItem.status)) {
    redirect(`/client/cases/${caseItem.id}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6">
          <Link
            href={`/client/cases/${caseItem.id}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Case
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-5 sm:p-6">

            <h1 className="text-2xl font-bold text-gray-900">
              Edit Case
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {caseItem.caseNumber}
            </p>

          </div>

          <form
            action={updateClientCase}
            className="space-y-6 p-5 sm:p-6"
          >

            <input
              type="hidden"
              name="id"
              value={caseItem.id}
            />

            {/* Case Type */}
            <div>

              <label
                htmlFor="caseType"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Case Type
              </label>

              <select
                id="caseType"
                name="caseType"
                required
                defaultValue={caseItem.caseType}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select case type
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
                required
                minLength={20}
                rows={8}
                defaultValue={caseItem.description}
                className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm leading-6 outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-gray-500">
                Minimum 20 characters.
              </p>

            </div>

            {/* Officer comment - read only */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Officer Comment
              </p>

              {caseItem.officerComment ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-blue-900">
                  {caseItem.officerComment}
                </p>
              ) : (
                <p className="mt-2 text-sm text-blue-700">
                  No officer comment yet.
                </p>
              )}

            </div>

            {/* Consultation - read only */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Consultation
              </p>

              {caseItem.consultationAt ? (
                <div className="mt-2 text-sm text-green-900">

                  <p className="font-semibold">
                    Scheduled
                  </p>

                  <p className="mt-1">
                    {new Date(
                      caseItem.consultationAt
                    ).toLocaleDateString("en-MW", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <p className="mt-1">
                    {new Date(
                      caseItem.consultationAt
                    ).toLocaleTimeString("en-MW", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                </div>
              ) : (
                <p className="mt-2 text-sm text-green-700">
                  No consultation scheduled.
                </p>
              )}

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
                href={`/client/cases/${caseItem.id}`}
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