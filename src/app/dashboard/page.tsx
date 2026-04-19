import Link from "next/link";
import { redirect } from "next/navigation";
import { BillingButton } from "@/components/BillingButton";
import { Logo } from "@/components/Logo";
import { LogoutForm } from "@/components/LogoutForm";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();

  const trialEnds = profile?.trial_ends_at ? new Date(profile.trial_ends_at as string) : null;
  const rawPhone = profile?.phone ? String(profile.phone) : "";
  const maskedPhone =
    rawPhone.length > 6 ? `${rawPhone.slice(0, 3)} … ${rawPhone.slice(-4)}` : rawPhone || "On file";

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <BillingButton />
            <LogoutForm />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <div>
          <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Access is gated on an active Stripe subscription or trial. Update billing any time from the customer
            portal.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Phone</p>
            <p className="mt-2 text-lg font-semibold text-white">{maskedPhone}</p>
            <p className="mt-2 text-xs text-zinc-500">One verified phone per account.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Trial ends</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {trialEnds ? trialEnds.toLocaleString() : "Not scheduled"}
            </p>
            <p className="mt-2 text-xs text-zinc-500">Synced from Stripe subscription trial settings.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Backtests run</p>
            <p className="mt-2 text-lg font-semibold text-white">{profile?.backtests_used ?? 0}</p>
            <p className="mt-2 text-xs text-zinc-500">Each saved run increments this counter.</p>
          </div>
        </div>

        <div className="glass flex flex-col items-start justify-between gap-4 rounded-3xl p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Run a new backtest</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Describe your playbook, pick an asset and horizon, and get metrics plus Claude-powered coaching.
            </p>
          </div>
          <Link
            href="/backtest"
            className="inline-flex rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-brand-400"
          >
            Open backtest lab
          </Link>
        </div>
      </main>
    </div>
  );
}
