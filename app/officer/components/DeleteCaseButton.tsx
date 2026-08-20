"use client";

import { useState } from "react";

type DeleteCaseButtonProps = {
  caseId: number;
  caseNumber: string;
  deleteAction: (formData: FormData) => void;
};

export default function DeleteCaseButton({
  caseId,
  caseNumber,
  deleteAction,
}: DeleteCaseButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete case ${caseNumber}?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const formData = new FormData(
      event.currentTarget
    );

    await deleteAction(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="hidden"
        name="id"
        value={caseId}
      />

      <button
        type="submit"
        disabled={deleting}
        className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete Case"}
      </button>
    </form>
  );
}