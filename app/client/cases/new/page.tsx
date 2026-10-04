"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type UploadResult = {
  success?: boolean;
  url?: string;
  fileName?: string;
  documentType?: string;
  error?: string;
};

async function parseResponse(
  response: Response
) {
  const contentType =
    response.headers.get("content-type") || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    const text = await response.text();

    console.error(
      "Non-JSON response:",
      response.status,
      text
    );

    throw new Error(
      `Server returned ${response.status} instead of JSON.`
    );
  }

  return response.json();
}

async function uploadFile(
  file: File,
  documentType:
    | "national-id"
    | "recommendation"
): Promise<UploadResult> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "documentType",
    documentType
  );

  const response = await fetch(
    "/api/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const result =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result.error ||
        "File upload failed."
    );
  }

  if (!result.url) {
    throw new Error(
      "Upload succeeded but no file URL was returned."
    );
  }

  return result;
}

export default function NewCasePage() {
  const router = useRouter();

  // ============================================
  // APPLICANT
  // ============================================

  const [applicantFullName, setApplicantFullName] =
    useState("");

  const [applicantNationalId, setApplicantNationalId] =
    useState("");

  const [applicantPhone, setApplicantPhone] =
    useState("");

  const [applicantEmail, setApplicantEmail] =
    useState("");

  const [applicantAddress, setApplicantAddress] =
    useState("");

  const [applicantDistrict, setApplicantDistrict] =
    useState("");

  const [
    applicantTraditionalAuthority,
    setApplicantTraditionalAuthority,
  ] = useState("");

  const [applicantVillage, setApplicantVillage] =
    useState("");

  const [
    applicantOccupation,
    setApplicantOccupation,
  ] = useState("");

  // ============================================
  // RESPONDENT
  // ============================================

  const [respondentName, setRespondentName] =
    useState("");

  const [respondentPhone, setRespondentPhone] =
    useState("");

  const [respondentAddress, setRespondentAddress] =
    useState("");

  const [
    respondentRelationship,
    setRespondentRelationship,
  ] = useState("");

  // ============================================
  // COMPLAINT
  // ============================================

  const [caseType, setCaseType] =
    useState("");

  const [complaintDate, setComplaintDate] =
    useState("");

  const [incidentLocation, setIncidentLocation] =
    useState("");

  const [description, setDescription] =
    useState("");

  // ============================================
  // LEGAL AID
  // ============================================

  const [legalAidReason, setLegalAidReason] =
    useState("");

  const [
    previousLegalAssistance,
    setPreviousLegalAssistance,
  ] = useState(false);

  const [
    previousLegalAssistanceDetails,
    setPreviousLegalAssistanceDetails,
  ] = useState("");

  // ============================================
  // FINANCIAL
  // ============================================

  const [employmentStatus, setEmploymentStatus] =
    useState("");

  const [occupation, setOccupation] =
    useState("");

  const [monthlyIncome, setMonthlyIncome] =
    useState("");

  const [otherIncome, setOtherIncome] =
    useState("");

  const [
    numberOfDependants,
    setNumberOfDependants,
  ] = useState("");

  const [
    financialCircumstances,
    setFinancialCircumstances,
  ] = useState("");

  // ============================================
  // DOCUMENTS
  // ============================================

  const [nationalId, setNationalId] =
    useState<File | null>(null);

  const [
    recommendationLetter,
    setRecommendationLetter,
  ] = useState<File | null>(null);

  // ============================================
  // STATE
  // ============================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!applicantFullName.trim()) {
      setError(
        "Please provide the applicant's full name."
      );
      return;
    }

    if (!respondentName.trim()) {
      setError(
        "Please provide the respondent's name."
      );
      return;
    }

    if (!caseType) {
      setError(
        "Please select a case type."
      );
      return;
    }

    if (description.trim().length < 20) {
      setError(
        "Case description must be at least 20 characters."
      );
      return;
    }

    if (!nationalId) {
      setError(
        "Please upload your National ID."
      );
      return;
    }

    if (!recommendationLetter) {
      setError(
        "Please upload a recommendation letter."
      );
      return;
    }

    if (
      nationalId.size >
      5 * 1024 * 1024
    ) {
      setError(
        "National ID must not exceed 5 MB."
      );
      return;
    }

    if (
      recommendationLetter.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Recommendation letter must not exceed 5 MB."
      );
      return;
    }

    setLoading(true);

    try {
      // ========================================
      // UPLOAD NATIONAL ID
      // ========================================

      const idResult =
        await uploadFile(
          nationalId,
          "national-id"
        );

      // ========================================
      // UPLOAD RECOMMENDATION
      // ========================================

      const recommendationResult =
        await uploadFile(
          recommendationLetter,
          "recommendation"
        );

      // ========================================
      // CREATE CASE
      // ========================================

      const response =
        await fetch(
          "/api/client/cases",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              applicantFullName,
              applicantNationalId,
              applicantPhone,
              applicantEmail,
              applicantAddress,
              applicantDistrict,
              applicantTraditionalAuthority,
              applicantVillage,
              applicantOccupation,

              respondentName,
              respondentPhone,
              respondentAddress,
              respondentRelationship,

              caseType,
              complaintDate,
              incidentLocation,
              description,

              legalAidReason,
              previousLegalAssistance,
              previousLegalAssistanceDetails,

              employmentStatus,
              occupation,
              monthlyIncome,
              otherIncome,
              numberOfDependants,
              financialCircumstances,

              nationalIdUrl:
                idResult.url,

              nationalIdFileName:
                idResult.fileName,

              recommendationUrl:
                recommendationResult.url,

              recommendationFileName:
                recommendationResult.fileName,
            }),
          }
        );

      const result =
        await parseResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to create case."
        );
      }

      router.push(
        "/client/dashboard"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "CASE SUBMISSION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // UI
  // ============================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/client/dashboard"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-8"
        >

          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Register a Case
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Complete the information below
              to submit your legal aid case.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* 1. APPLICANT */}
          {/* ================================= */}

          <section className="rounded-xl border border-gray-200 p-5">

            <h2 className="text-lg font-bold text-gray-900">
              1. Applicant Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Provide the details of the person
              seeking legal assistance.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <Input
                label="Full Name"
                value={applicantFullName}
                onChange={setApplicantFullName}
                required
              />

              <Input
                label="National ID Number"
                value={applicantNationalId}
                onChange={setApplicantNationalId}
              />

              <Input
                label="Phone Number"
                value={applicantPhone}
                onChange={setApplicantPhone}
              />

              <Input
                label="Email"
                type="email"
                value={applicantEmail}
                onChange={setApplicantEmail}
              />

              <Input
                label="District"
                value={applicantDistrict}
                onChange={setApplicantDistrict}
              />

              <Input
                label="Traditional Authority"
                value={
                  applicantTraditionalAuthority
                }
                onChange={
                  setApplicantTraditionalAuthority
                }
              />

              <Input
                label="Village"
                value={applicantVillage}
                onChange={setApplicantVillage}
              />

              <Input
                label="Occupation"
                value={applicantOccupation}
                onChange={setApplicantOccupation}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Address"
                  value={applicantAddress}
                  onChange={setApplicantAddress}
                />
              </div>

            </div>
          </section>

          {/* ================================= */}
          {/* 2. RESPONDENT */}
          {/* ================================= */}

          <section className="rounded-xl border border-gray-200 p-5">

            <h2 className="text-lg font-bold text-gray-900">
              2. Respondent Details
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <Input
                label="Respondent Name"
                value={respondentName}
                onChange={setRespondentName}
                required
              />

              <Input
                label="Phone Number"
                value={respondentPhone}
                onChange={setRespondentPhone}
              />

              <Input
                label="Relationship to Applicant"
                value={
                  respondentRelationship
                }
                onChange={
                  setRespondentRelationship
                }
              />

              <Input
                label="Address"
                value={respondentAddress}
                onChange={setRespondentAddress}
              />

            </div>
          </section>

          {/* ================================= */}
          {/* 3. COMPLAINT */}
          {/* ================================= */}

          <section className="rounded-xl border border-gray-200 p-5">

            <h2 className="text-lg font-bold text-gray-900">
              3. Complaint Details
            </h2>

            <div className="mt-5 space-y-4">

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Case Type
                  </label>

                  <select
                    value={caseType}
                    onChange={(e) =>
                      setCaseType(
                        e.target.value
                      )
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

                <Input
                  label="Date of Incident"
                  type="date"
                  value={complaintDate}
                  onChange={
                    setComplaintDate
                  }
                />

              </div>

              <Input
                label="Location of Incident"
                value={incidentLocation}
                onChange={
                  setIncidentLocation
                }
              />

              <Textarea
                label="Detailed Complaint"
                value={description}
                onChange={setDescription}
                required
                rows={8}
                placeholder="Describe what happened, when it happened, who was involved and what assistance you require."
              />

              <p className="text-xs text-gray-500">
                Minimum 20 characters.
              </p>

            </div>
          </section>

          {/* ================================= */}
          {/* 4. LEGAL AID */}
          {/* ================================= */}

          <section className="rounded-xl border border-gray-200 p-5">

            <h2 className="text-lg font-bold text-gray-900">
              4. Legal Aid
            </h2>

            <div className="mt-5 space-y-4">

              <Textarea
                label="Why do you require legal aid?"
                value={legalAidReason}
                onChange={
                  setLegalAidReason
                }
                rows={5}
              />

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    previousLegalAssistance
                  }
                  onChange={(e) =>
                    setPreviousLegalAssistance(
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                Have you received legal assistance before?
              </label>

              {previousLegalAssistance && (
                <Textarea
                  label="Previous Legal Assistance Details"
                  value={
                    previousLegalAssistanceDetails
                  }
                  onChange={
                    setPreviousLegalAssistanceDetails
                  }
                  rows={4}
                />
              )}

            </div>
          </section>

          {/* ================================= */}
          {/* 5. FINANCIAL */}
          {/* ================================= */}

          <section className="rounded-xl border border-gray-200 p-5">

            <h2 className="text-lg font-bold text-gray-900">
              5. Financial Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This information helps assess
              eligibility for legal aid.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <Input
                label="Employment Status"
                value={employmentStatus}
                onChange={
                  setEmploymentStatus
                }
                placeholder="Employed, unemployed, self-employed..."
              />

              <Input
                label="Occupation"
                value={occupation}
                onChange={setOccupation}
              />

              <Input
                label="Monthly Income"
                type="number"
                value={monthlyIncome}
                onChange={setMonthlyIncome}
              />

              <Input
                label="Other Income"
                type="number"
                value={otherIncome}
                onChange={setOtherIncome}
              />

              <Input
                label="Number of Dependants"
                type="number"
                value={numberOfDependants}
                onChange={
                  setNumberOfDependants
                }
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Financial Circumstances"
                  value={
                    financialCircumstances
                  }
                  onChange={
                    setFinancialCircumstances
                  }
                  rows={5}
                  placeholder="Explain your financial circumstances..."
                />
              </div>

            </div>
          </section>

          {/* ================================= */}
          {/* 6. DOCUMENTS */}
          {/* ================================= */}

          <section className="rounded-xl border border-gray-200 p-5">

            <h2 className="text-lg font-bold text-gray-900">
              6. Supporting Documents
            </h2>

            <div className="mt-5 space-y-6">

              <FileUpload
                title="National ID"
                description="Upload a clear image or PDF of your National ID."
                file={nationalId}
                onChange={setNationalId}
                required
              />

              <FileUpload
                title="Recommendation Letter"
                description="Upload a recommendation letter from a Village Headman, Local Court or Legal Officer."
                file={recommendationLetter}
                onChange={
                  setRecommendationLetter
                }
                required
              />

            </div>
          </section>

          {/* ================================= */}
          {/* NOTICE */}
          {/* ================================= */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

            <p className="font-semibold text-blue-900">
              Before submitting
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Please make sure the information
              provided is accurate and that both
              required documents are clear and
              readable.
            </p>

          </div>

          {/* ================================= */}
          {/* BUTTONS */}
          {/* ================================= */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Submitting Case..."
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

// ============================================
// REUSABLE INPUT
// ============================================

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

// ============================================
// REUSABLE TEXTAREA
// ============================================

function Textarea({
  label,
  value,
  onChange,
  rows = 4,
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <textarea
        value={value}
        rows={rows}
        required={required}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

// ============================================
// FILE UPLOAD
// ============================================

function FileUpload({
  title,
  description,
  file,
  onChange,
  required = false,
}: {
  title: string;
  description: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

      <h3 className="font-semibold text-gray-900">
        {title}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        required={required}
        onChange={(e) =>
          onChange(
            e.target.files?.[0] ||
              null
          )
        }
        className="mt-4 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:border-r file:border-gray-300 file:bg-blue-600 file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700"
      />

      {file && (
        <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          ✓ Selected: {file.name}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        PDF, JPG, PNG or WEBP · Maximum 5 MB
      </p>

    </div>
  );
}