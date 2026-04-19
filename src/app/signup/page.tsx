import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignupWizard } from "@/components/SignupWizard";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const canceled = searchParams.canceled === "1";
  const paywall = searchParams.paywall === "1";

  return (
    <div className="min-h-screen bg-ink-950 px-4 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            Back to home
          </Link>
        </div>

        {canceled && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Checkout was canceled. You can restart payment whenever you are ready—your phone verification may need to be
            repeated after an hour.
          </p>
        )}
        {paywall && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
            Your trial or subscription is not active. Update billing to keep using BacktestAI.
          </p>
        )}

        <div className="glass rounded-3xl p-8">
          <h1 className="text-2xl font-semibold text-white">Create your BacktestAI account</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Verify your phone, confirm the SMS code, then add a card to unlock the 3-day trial. One phone number can
            only be attached to a single account.
          </p>
          <div className="mt-8">
            <SignupWizard />
          </div>
        </div>
      </div>
    </div>
  );
}
