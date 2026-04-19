import { NextResponse } from "next/server";
import twilio from "twilio";
import { normalizeUsPhone } from "@/lib/phone";
import { createVerifiedSignupSession, signupSessionCookie } from "@/lib/signup-session";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  phone: z.string().min(8).max(32),
  code: z.string().min(4).max(10),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const phoneE164 = normalizeUsPhone(parsed.data.phone);
  if (!phoneE164) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID!;
  const client = twilio(sid, token);

  let check;
  try {
    check = await client.verify.v2.services(verifySid).verificationChecks.create({
      to: phoneE164,
      code: parsed.data.code,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }

  if (check.status !== "approved") {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  const tokenValue = createVerifiedSignupSession(phoneE164);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(signupSessionCookie.name, tokenValue, signupSessionCookie.options);
  return res;
}
