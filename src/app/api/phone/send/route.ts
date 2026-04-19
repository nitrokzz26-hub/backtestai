import { NextResponse } from "next/server";
import twilio from "twilio";
import { normalizeUsPhone } from "@/lib/phone";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({ phone: z.string().min(8).max(32) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const phoneE164 = normalizeUsPhone(parsed.data.phone);
  if (!phoneE164) {
    return NextResponse.json({ error: "Enter a valid US or international number" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data: existing } = await admin.from("users").select("id").eq("phone", phoneE164).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "This phone is already registered" }, { status: 409 });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID!;
  const client = twilio(sid, token);

  try {
    await client.verify.v2.services(verifySid).verifications.create({
      to: phoneE164,
      channel: "sms",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not send SMS. Try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, phone: phoneE164 });
}
