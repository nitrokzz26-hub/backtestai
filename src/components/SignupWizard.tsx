"use client";

import { useMemo, useState } from "react";

type Step = 1 | 2 | 3;

export function SignupWizard() {
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => phone.replace(/\D/g, "").length >= 10, [phone]);

  async function sendCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not send SMS");
      if (data.phone) setPhone(data.phone);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout");
      if (!data.url) throw new Error("Missing checkout URL");
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {[
          { id: 1, label: "Phone" },
          { id: 2, label: "SMS code" },
          { id: 3, label: "Card" },
        ].map((s, idx) => (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border text-[11px] ${
                step >= s.id ? "border-brand-400 bg-brand-500/20 text-brand-100" : "border-white/10 text-zinc-500"
              }`}
            >
              {s.id}
            </span>
            <span className={step === s.id ? "text-white" : ""}>{s.label}</span>
            {idx < 2 && <span className="text-zinc-600">/</span>}
          </li>
        ))}
      </ol>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-50">{error}</p>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-200">
            Mobile number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 555-0100"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-brand-500/40 focus:ring-2"
              autoComplete="tel"
            />
          </label>
          <button
            type="button"
            disabled={!canSend || loading}
            onClick={sendCode}
            className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Sending…" : "Send SMS code"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Enter the verification code we sent to <span className="font-semibold text-white">{phone}</span>.
          </p>
          <label className="block text-sm font-medium text-zinc-200">
            SMS code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-brand-500/40 focus:ring-2"
              inputMode="numeric"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-full border border-white/15 py-3 text-sm font-semibold text-white hover:border-white/30"
            >
              Back
            </button>
            <button
              type="button"
              disabled={code.trim().length < 4 || loading}
              onClick={verifyCode}
              className="flex-1 rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Checking…" : "Verify"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">
            Add a card to activate your 3-day trial. You will not be charged until the trial ends, then billing is $10
            every 15 days unless you cancel in the Stripe customer portal.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={startCheckout}
            className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Redirecting…" : "Continue to secure checkout"}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full text-sm text-zinc-400 hover:text-white"
          >
            Back to SMS step
          </button>
        </div>
      )}
    </div>
  );
}
