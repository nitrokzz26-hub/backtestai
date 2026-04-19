import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-zinc-300">
          <Link href="/#how" className="hover:text-white">
            How it works
          </Link>
          <Link href="/#pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand-500 px-4 py-2 font-medium text-ink-950 hover:bg-brand-400"
          >
            Start free trial
          </Link>
        </nav>
      </div>
    </header>
  );
}
