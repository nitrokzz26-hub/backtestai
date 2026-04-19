import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-emerald-700 text-ink-950 shadow-lg shadow-brand-500/20">
        B
      </span>
      <span>
        Backtest<span className="text-brand-400">AI</span>
      </span>
    </Link>
  );
}
