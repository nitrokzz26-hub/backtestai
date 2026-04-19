"use client";

import { useState } from "react";

export function BillingButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not open billing portal");
      window.location.href = data.url as string;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:border-white/30 disabled:opacity-40"
    >
      {loading ? "Opening…" : "Manage billing"}
    </button>
  );
}
