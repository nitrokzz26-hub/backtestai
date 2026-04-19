import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Asset, Timeframe } from "@/lib/constants";
import { runMovingAverageBacktest } from "@/lib/backtest";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  strategy: z.string().min(20).max(8000),
  asset: z.enum(["BTC", "ETH", "SPY", "QQQ", "AAPL", "TSLA", "SOL"]),
  timeframe: z.enum(["1H", "4H", "Daily", "Weekly"]),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("is_active, backtests_used")
    .eq("id", user.id)
    .maybeSingle();

  const hasAccess = profile?.is_active === true;
  if (!hasAccess) {
    return NextResponse.json({ error: "Subscription required" }, { status: 402 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { strategy, asset, timeframe } = parsed.data;
  const results = await runMovingAverageBacktest({
    strategy,
    asset: asset as Asset,
    timeframe: timeframe as Timeframe,
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `You help US retail traders (stocks + crypto). Backtest used a dual moving-average crossover engine tuned by keywords in the trader's description (faster windows for scalping language, slower for swing/position language).

Strategy description:
${strategy}

Asset: ${asset}. Timeframe: ${timeframe}.

Metrics:
- Total return (%): ${results.totalReturnPct}
- Win rate (%): ${results.winRatePct}
- Max drawdown (%): ${results.maxDrawdownPct}
- Sharpe (annualized, rough): ${results.sharpeRatio}
- Completed round-trips (approx): ${results.trades}

Write:
1) A short plain-English summary of how the strategy likely behaved on this history and what the metrics imply.
2) Exactly three numbered improvement suggestions tailored to this trader.

Keep total under 220 words. End with one brief sentence that past performance does not guarantee future results.`;

  let ai_analysis = "";
  try {
    const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022";
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.find((b) => b.type === "text");
    ai_analysis = text && text.type === "text" ? text.text : "";
  } catch (e) {
    console.error(e);
    ai_analysis =
      "AI analysis is temporarily unavailable. Your numeric results are still shown below. Try again in a few minutes.";
  }

  const { data: inserted, error } = await supabase.from("backtests").insert({
    user_id: user.id,
    strategy,
    asset,
    timeframe,
    results: results as unknown as Record<string, unknown>,
    ai_analysis,
  }).select("id").single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save backtest" }, { status: 500 });
  }

  const used = typeof profile?.backtests_used === "number" ? profile.backtests_used : 0;
  await supabase.from("users").update({ backtests_used: used + 1 }).eq("id", user.id);

  return NextResponse.json({ id: inserted.id, results, ai_analysis });
}
