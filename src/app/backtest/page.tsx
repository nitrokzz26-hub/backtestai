import Link from "next/link";
import { redirect } from "next/navigation";
import { BacktestRunner } from "@/components/BacktestRunner";
import { Logo } from "@/components/Logo";
import { LogoutForm } from "@/components/LogoutForm";
import { createClient } from "@/lib/supabase/server";

export default async function BacktestPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-zinc-300 hover:text-white">
              Dashboard
            </Link>
            <LogoutForm />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Backtest lab</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Turn words into performance metrics</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Historical prices come from Yahoo Finance where available. If a symbol cannot be fetched in your
            environment, a deterministic synthetic series is used so the UI still demonstrates the full workflow.
          </p>
        </div>

        <BacktestRunner />
      </main>
    </div>
  );
}
