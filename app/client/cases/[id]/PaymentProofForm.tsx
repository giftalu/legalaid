
"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { submitPayment } from "@/app/client/actions";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function PaymentProofForm({
  caseId,
  clientId,
  outstanding,
}: {
  caseId: number;
  clientId: number;
  outstanding: number;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const file = fileInput.current?.files?.[0];

    if (!file) {
      setError("Please select your payment proof.");
      return;
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("Payment proof must be larger than 0 and no more than 10 MB.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Upload a PDF, JPG, PNG, or WebP file.");
      return;
    }

    setLoading(true);

    try {
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(0, 150);

      // The file travels directly from the browser to private Blob storage.
      const blob = await upload(
       `legal-aid/${clientId}/payments/${caseId}/${Date.now()}-${safeName}`,
        file,
        {
          access: "private",
          handleUploadUrl: "/api/client/payments/upload",
          contentType: file.type,
          multipart: true,
          clientPayload: JSON.stringify({ caseId }),
        }
      );

      // Only small text fields and the resulting Blob URL go to the Server Action.
      const formData = new FormData(form);
      formData.delete("proof");
      formData.set("proofUrl", blob.url);
      formData.set("proofFileName", file.name);

      await submitPayment(formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit payment proof. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <input type="hidden" name="caseId" value={caseId} />

      <div>
        <label
          htmlFor="payment-amount"
          className="mb-1 block text-sm font-semibold text-gray-700"
        >
          Amount Paid (MWK)
        </label>

        <input
          id="payment-amount"
          name="amount"
          type="number"
          min="0.01"
          max={outstanding}
          step="0.01"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900"
          placeholder="Enter amount paid"
        />

        <p className="mt-1 text-xs text-gray-500">
          Maximum outstanding balance:{" "}
          {outstanding.toLocaleString("en-MW", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          MWK
        </p>
      </div>

      <div>
        <label
          htmlFor="transaction-id"
          className="mb-1 block text-sm font-semibold text-gray-700"
        >
          Transaction ID
        </label>

        <input
          id="transaction-id"
          name="transactionId"
          type="text"
          maxLength={200}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900"
          placeholder="Enter bank or mobile-money transaction ID"
        />
      </div>

      <div>
        <label
          htmlFor="payment-proof"
          className="mb-1 block text-sm font-semibold text-gray-700"
        >
          Deposit Slip / Payment Proof
        </label>

        <input
          ref={fileInput}
          id="payment-proof"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          required
          className="block w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:font-semibold"
        />

        <p className="mt-1 text-xs text-gray-500">
          PDF, JPG, PNG, or WebP. Maximum size: 10 MB.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Uploading and submitting..." : "Submit Payment Proof"}
      </button>
    </form>
  );
}
