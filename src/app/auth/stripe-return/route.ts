import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { decodeSignupSession, signupSessionCookie } from "@/lib/signup-session";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function emailForPhone(phoneE164: string) {
  const slug = Buffer.from(phoneE164, "utf8").toString("base64url");
  return `${slug}@phone.backtestai.app`;
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  const cookieStore = cookies();
  const raw = cookieStore.get(signupSessionCookie.name)?.value;
  const verified = raw ? decodeSignupSession(raw) : null;
  if (!verified) {
    return NextResponse.redirect(new URL("/signup?expired=1", req.url));
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });

  if (checkout.status !== "complete") {
    return NextResponse.redirect(new URL("/signup?payment=1", req.url));
  }

  if (checkout.payment_status !== "paid" && checkout.payment_status !== "no_payment_required") {
    return NextResponse.redirect(new URL("/signup?payment=1", req.url));
  }

  const phone = checkout.metadata?.phone ?? verified.phoneE164;
  if (phone !== verified.phoneE164) {
    return NextResponse.redirect(new URL("/signup?invalid=1", req.url));
  }

  const customerId =
    typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id;
  const subRaw = checkout.subscription;
  const subId = typeof subRaw === "string" ? subRaw : subRaw?.id;
  if (!customerId || !subId) {
    return NextResponse.redirect(new URL("/signup?session=1", req.url));
  }

  const sub = typeof subRaw === "object" && subRaw && "status" in subRaw ? subRaw : await stripe.subscriptions.retrieve(subId);
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
  const active = sub.status === "trialing" || sub.status === "active";

  const admin = createServiceRoleClient();
  const email = emailForPhone(phone);

  const { data: existingProfile } = await admin.from("users").select("id").eq("phone", phone).maybeSingle();

  let userId = existingProfile?.id as string | undefined;

  if (!userId) {
    const password = randomBytes(24).toString("hex");
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone },
    });

    if (createErr || !created.user) {
      const msg = createErr?.message ?? "Could not create account";
      console.error(createErr);
      return NextResponse.redirect(new URL(`/signup?err=${encodeURIComponent(msg)}`, req.url));
    }

    userId = created.user.id;

    const { error: insertErr } = await admin.from("users").insert({
      id: userId,
      phone,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      trial_ends_at: trialEnd,
      is_active: active,
    });

    if (insertErr) {
      console.error(insertErr);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.redirect(new URL("/signup?db=1", req.url));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const redirect = NextResponse.redirect(new URL("/dashboard", appUrl));
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => redirect.cookies.set(name, value, options));
          },
        },
      },
    );

    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr) {
      console.error(signErr);
      return NextResponse.redirect(new URL("/signup?auth=1", req.url));
    }

    redirect.cookies.set(signupSessionCookie.name, "", { ...signupSessionCookie.options, maxAge: 0 });
    return redirect;
  }

  await admin
    .from("users")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      trial_ends_at: trialEnd,
      is_active: active,
    })
    .eq("id", userId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${appUrl}/auth/callback` },
  });

  if (linkErr || !link.properties?.action_link) {
    console.error(linkErr);
    return NextResponse.redirect(new URL("/signup?link=1", req.url));
  }

  const res = NextResponse.redirect(link.properties.action_link);
  res.cookies.set(signupSessionCookie.name, "", { ...signupSessionCookie.options, maxAge: 0 });
  return res;
}
