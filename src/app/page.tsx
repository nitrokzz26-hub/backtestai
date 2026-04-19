import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const features = [
  {
    title: "Plain English strategies",
    body: "Describe entries, filters, and risk in your own words. We translate that into a disciplined moving-average regime test tuned to your wording.",
  },
  {
    title: "Crypto + US equities",
    body: "BTC, ETH, SOL, and household stock ETFs and names traders already watch every session.",
  },
  {
    title: "Claude-powered coaching",
    body: "Every run ends with a concise read on your metrics plus three concrete ideas to tighten risk and robustness.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-ink-950 to-ink-950">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200/90">
              Built for US retail traders
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Backtest trading ideas in minutes, not weekends.
            </h1>
            <p className="text-lg text-zinc-300 md:text-xl">
              BacktestAI turns your strategy description into historical performance, drawdowns, and a Sharpe-style
              read—then Claude explains what it means and how to improve.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/signup"
                className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-brand-500/25 hover:bg-brand-400"
              >
                Start 3-day trial
              </Link>
              <Link
                href="/#how"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-white/30"
              >
                See how it works
              </Link>
            </div>
            <p className="text-sm text-zinc-400">
              $10 every 15 days after trial · card required upfront · SMS-verified accounts · cancel anytime in billing
              portal
            </p>
          </div>
        </section>

        <section id="how" className="border-t border-white/10 bg-ink-950/60 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-white">How it works</h2>
              <p className="mt-3 text-zinc-300">
                Three fast steps to a professional-style report without wrestling with data vendors or notebooks.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { step: "01", title: "Verify your phone", body: "We send a one-time SMS code so one phone stays tied to one account." },
                { step: "02", title: "Add a card", body: "Stripe secures your payment method before the trial starts—no surprises when you continue." },
                { step: "03", title: "Run backtests", body: "Pick an asset and timeframe, describe the playbook, and review metrics plus AI coaching." },
              ].map((s) => (
                <div key={s.step} className="glass rounded-2xl p-6">
                  <p className="text-xs font-semibold tracking-[0.2em] text-brand-300">{s.step}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-white">Simple pricing</h2>
              <p className="mt-3 text-zinc-300">Try everything, then stay on a short renewal cadence that matches active traders.</p>
            </div>
            <div className="mt-10 max-w-md">
              <div className="glass rounded-3xl p-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">Standard</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-4xl font-semibold text-white">$10</p>
                  <p className="text-zinc-400">/ 15 days</p>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                  <li>3-day full-access trial</li>
                  <li>Card required before trial begins</li>
                  <li>Auto-renews every 15 days</li>
                  <li>Hard paywall after trial if billing is not active</li>
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 flex w-full items-center justify-center rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink-950 hover:bg-brand-400"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-white">Ready to stress-test your next idea?</h2>
              <p className="mt-2 text-zinc-300">Join BacktestAI and ship smarter trade plans with data on your side.</p>
            </div>
            <Link
              href="/signup"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-zinc-100"
            >
              Start free trial
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} BacktestAI · For informational research, not personalized investment advice.
      </footer>
    </div>
  );
}
