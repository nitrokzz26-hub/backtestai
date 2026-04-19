import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function syncSubscription(sub: Stripe.Subscription) {
  const admin = createServiceRoleClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
  const active = sub.status === "trialing" || sub.status === "active";

  const { data: row } = await admin
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!row) return;

  await admin
    .from("users")
    .update({
      stripe_subscription_id: sub.id,
      trial_ends_at: trialEnd,
      is_active: active,
    })
    .eq("id", row.id);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = headers().get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!customerId || !subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const phone = session.metadata?.phone;
        if (!phone) break;

        const admin = createServiceRoleClient();
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
        const active = sub.status === "trialing" || sub.status === "active";

        const { data: existing } = await admin.from("users").select("id").eq("phone", phone).maybeSingle();
        if (existing) {
          await admin
            .from("users")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
              trial_ends_at: trialEnd,
              is_active: active,
            })
            .eq("id", existing.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
