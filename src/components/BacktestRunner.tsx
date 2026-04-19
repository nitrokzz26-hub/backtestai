"use client";

import { useMemo, useState } from "react";
import { EquityChart } from "@/components/EquityChart";
import { ASSETS, TIMEFRAMES } from "@/lib/constants";

type Metrics = {
  totalReturnPct: number;
  winRatePct: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  trades: number;
  equityCurve: { t: string; equity: number }[];
};

const steps = [
  "Fetching market history…",
  "Simulating trades with your wording…",
  "Computing risk metrics…",
  "Asking Claude for coaching…",
];

export function BacktestRunner() {
  const [strategy, setStrategy] = useState(
    "Buy when momentum turns positive after a pullback, exit when price closes below the 20-period moving average. Prefer swing holds over scalps.",
  );
  const [asset, setAsset] = useState<(typeof ASSETS)[number]>("SPY");
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>("Daily");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Metrics | null>(null);
  const [ai, setAi] = useState<string | null>(null);

  const progressLabel = useMemo(() => steps[Math.min(stepIdx, steps.length - 1)], [stepIdx]);

  async function run() {
    setError(null);
    setResults(null);
    setAi(null);
    setLoading(true);
    setStepIdx(0);

    const timers = steps.map((_, i) =>
      window.setTimeout(() => setStepIdx(i + 1), (i + 1) * 900),
    );

    try {
      const res = await fetch("/api/backtests/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy, asset, timeframe }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Backtest failed");
      setResults(data.results as Metrics);
      setAi(data.ai_analysis as string);
      setStepIdx(steps.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      timers.forEach((t) => window.clearTimeout(t));
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white">Strategy</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Describe entries, filters, and how you think about risk. We map keywords to faster or slower moving-average
            windows before running the historical simulation.
          </p>
          <textarea
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            rows={10}
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-brand-500/40 focus:ring-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-200">
            Asset
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value as (typeof ASSETS)[number])}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-brand-500/40 focus:ring-2"
            >
              {ASSETS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-200">
            Timeframe
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as (typeof TIMEFRAMES)[number])}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-brand-500/40 focus:ring-2"
            >
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={loading || strategy.trim().length < 20}
          onClick={run}
          className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-ink-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Running…" : "Run backtest"}
        </button>

        {loading && (
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-50">
            <p className="font-semibold text-white">Working through the pipeline</p>
            <p className="mt-1 text-brand-100">{progressLabel}</p>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-50">{error}</p>
        )}
      </div>

      <div className="space-y-6">
        {results && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Total return", value: `${results.totalReturnPct.toFixed(2)}%` },
                { label: "Win rate", value: `${results.winRatePct.toFixed(1)}%` },
                { label: "Max drawdown", value: `${results.maxDrawdownPct.toFixed(2)}%` },
                { label: "Sharpe (approx.)", value: `${results.sharpeRatio.toFixed(2)}` },
              ].map((m) => (
                <div key={m.label} className="glass rounded-2xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{m.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
                </div>
              ))}
              <div className="glass rounded-2xl p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Round-trip trades</p>
                <p className="mt-2 text-2xl font-semibold text-white">{results.trades}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white">Equity curve</h3>
              <p className="mt-1 text-xs text-zinc-500">Hypothetical equity for the tested moving-average ruleset.</p>
              <div className="mt-4">
                <EquityChart data={results.equityCurve} />
              </div>
            </div>

            {ai && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white">Claude analysis</h3>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{ai}</div>
              </div>
            )}
          </>
        )}

        {!results && !loading && (
          <div className="glass flex min-h-[320px] items-center justify-center rounded-2xl p-8 text-center text-sm text-zinc-400">
            Results will appear here after your first run.
          </div>
        )}
      </div>
    </div>
  );
}
