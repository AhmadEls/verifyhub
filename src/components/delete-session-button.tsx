"use client";

import { useState } from "react";

export function DeleteSessionButton({
  sessionId,
}: {
  sessionId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      "Delete this verification session?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await fetch(
        `/api/sessions/${sessionId}/delete`,
        {
          method: "DELETE",
        }
      );

      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      alert("Failed to delete session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
    >
      {loading
        ? "Deleting..."
        : "Delete Session"}
    </button>
  );
}