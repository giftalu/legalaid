"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCasePage() {
  const router = useRouter();

  const [caseType, setCaseType] = useState("");
  const [description, setDescription] = useState("");

  const [nationalId, setNationalId] =
    useState<File | null>(null);

  const [recommendationLetter, setRecommendationLetter] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!caseType) {
      setError("Please select a case type.");
      return;
    }

    if (description.trim().length < 20) {
      setError(
        "Case description must be at least 20 characters."
      );
      return;
    }

    if (!nationalId) {
      setError("Please upload your National ID.");
      return;
    }

    if (!recommendationLetter) {
      setError(
        "Please upload a recommendation letter from a village headman, local court or legal officer."
      );
      return;
    }

    setLoading(true);

    try {
      // Upload National ID
      const idFormData = new FormData();

      idFormData.append("file", nationalId);
      idFormData.append(
        "documentType",
        "national-id"
      );

      const idResponse = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: idFormData,
        }
      );

      const idResult = await idResponse.json();

      if (!idResponse.ok) {
        throw new Error(
          idResult.error ||
          "National ID upload failed."
        );
      }

      // Upload recommendation
      const recommendationFormData =
        new FormData();

      recommendationFormData.append(
        "file",
        recommendationLetter
      );

      recommendationFormData.append(
        "documentType",
        "recommendation"
      );

      const recommendationResponse =
        await fetch("/api/upload", {
          method: "POST",
          body: recommendationFormData,
        });

      const recommendationResult =
        await recommendationResponse.json();

      if (!recommendationResponse.ok) {
        throw new Error(
          recommendationResult.error ||
          "Recommendation letter upload failed."
        );
      }

      // Create case
      const response = await fetch(
        "/api/client/cases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caseType,
            description,
            nationalIdUrl: idResult.url,
            nationalIdFileName:
              idResult.fileName,
            recommendationUrl:
              recommendationResult.url,
            recommendationFileName:
              recommendationResult.fileName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          "Failed to create case."
        );
      }

      router.push("/client/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        <Link
          href="/client/dashboard"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-8"
        >

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Register a Case
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Provide your case details and required
              supporting documents.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

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
              value={caseType}
              onChange={(e) =>
                setCaseType(e.target.value)
              }
              required
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
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
              minLength={20}
              rows={8}
              placeholder="Describe your legal matter in detail..."
              className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm leading-6 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Minimum 20 characters.
            </p>
          </div>

          {/* National ID */}
          <div className="rounded-xl border border-gray-200 p-5">

            <h2 className="font-semibold text-gray-900">
              National ID
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload a clear image or PDF of your National ID.
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) =>
                setNationalId(e.target.files?.[0] || null)
              }
              className="mt-4 block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-700
    file:mr-4
    file:cursor-pointer
    file:border-0
    file:border-r
    file:border-gray-300
    file:bg-blue-600
    file:px-4
    file:py-2.5
    file:font-semibold
    file:text-white
    hover:file:bg-blue-700"
              required
            />

            {nationalId && (
              <p className="mt-2 text-xs text-green-700">
                Selected: {nationalId.name}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Maximum file size: 5 MB.
            </p>

          </div>

          {/* Recommendation */}
          <div className="rounded-xl border border-gray-200 p-5">

            <h2 className="font-semibold text-gray-900">
              Recommendation Letter
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Upload a recommendation letter from one
              of the following:
            </p>

            <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
              <li>Village Headman</li>
              <li>Local Court</li>
              <li>Legal Officer</li>
            </ul>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) =>
                setRecommendationLetter(
                  e.target.files?.[0] || null
                )
              }
              className="mt-4 block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-700
    file:mr-4
    file:cursor-pointer
    file:border-0
    file:border-r
    file:border-gray-300
    file:bg-blue-600
    file:px-4
    file:py-2.5
    file:font-semibold
    file:text-white
    hover:file:bg-blue-700"
              required
            />

            {recommendationLetter && (
              <p className="mt-2 text-xs text-green-700">
                Selected:{" "}
                {recommendationLetter.name}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Maximum file size: 5 MB.
            </p>

          </div>

          {/* Notice */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

            <p className="font-semibold text-blue-900">
              Required documents
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Your National ID and recommendation letter
              will be attached to your case for review by
              the legal officer.
            </p>

          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Submitting..."
                : "Submit Case"}
            </button>

            <Link
              href="/client/dashboard"
              className="flex-1 rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

          </div>

        </form>

      </div>
    </main>
  );
}