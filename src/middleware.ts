import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const protectedPaths = ["/dashboard", "/backtest"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const { supabaseResponse, user } = await updateSession(request);

  if (!isProtected) {
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const admin = createServiceRoleClient();
  const { data: profile } = await admin.from("users").select("is_active").eq("id", user.id).maybeSingle();

  const hasAccess = profile?.is_active === true;

  if (!hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    url.searchParams.set("paywall", "1");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
