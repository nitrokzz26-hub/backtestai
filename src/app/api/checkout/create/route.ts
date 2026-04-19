import { NextResponse } from "next/server";
import { decodeSignupSession, signupSessionCookie } from "@/lib/signup-session";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
  }

  const cookieStore = cookies();
  const raw = cookieStore.get(signupSessionCookie.name)?.value;
  const session = raw ? decodeSignupSession(raw) : null;
  if (!session) {
    return NextResponse.json({ error: "Phone verification expired. Start again." }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { data: existing } = await admin.from("users").select("id").eq("phone", session.phoneE164).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Account already exists for this phone" }, { status: 409 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: false,
    subscription_data: {
      trial_period_days: 3,
      metadata: { phone: session.phoneE164 },
    },
    payment_method_collection: "always",
    success_url: `${appUrl}/auth/stripe-return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/signup?canceled=1`,
    metadata: { phone: session.phoneE164 },
    customer_creation: "always",
  });

  return NextResponse.json({ url: checkout.url });
}
