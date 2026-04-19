import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "backtestai_signup";
const MAX_AGE_SEC = 60 * 60; // 1 hour to finish checkout

export type SignupSessionPayload = {
  phoneE164: string;
  exp: number;
};

function getSecret() {
  const s = process.env.SIGNUP_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SIGNUP_SESSION_SECRET must be set (min 16 chars)");
  }
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function encodeSignupSession(data: SignupSessionPayload): string {
  const body = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function decodeSignupSession(token: string): SignupSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const json = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignupSessionPayload;
    if (!json.phoneE164 || typeof json.exp !== "number") return null;
    if (Date.now() / 1000 > json.exp) return null;
    return json;
  } catch {
    return null;
  }
}

export function createVerifiedSignupSession(phoneE164: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  return encodeSignupSession({ phoneE164, exp });
}

export const signupSessionCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  },
};
