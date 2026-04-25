import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicRoutes = ["/", "/login", "/register", "/reset-password"];
const alwaysPublicRoutes = ["/update-password", "/auth/callback", "/auth/logout"];

const ONBOARDING_COOKIE = "ef_onboarded";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { user, supabaseResponse, supabase } = await updateSession(request);

  // Always-public routes
  if (alwaysPublicRoutes.includes(pathname)) {
    return supabaseResponse;
  }

  // Public routes: if logged in, redirect to dashboard
  if (publicRoutes.includes(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Protected routes: if not logged in, redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check onboarding via cookie first (avoids DB query on every request)
  const onboardingCookie = request.cookies.get(ONBOARDING_COOKIE)?.value;

  let onboardingCompleted = onboardingCookie === "1";

  // If cookie not set, query DB once and set the cookie
  if (!onboardingCookie) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    onboardingCompleted = profile?.onboarding_completed ?? false;

    // Set cookie so future requests skip DB query
    if (onboardingCompleted) {
      supabaseResponse.cookies.set(ONBOARDING_COOKIE, "1", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  // Not onboarded: force to /onboarding
  if (!onboardingCompleted && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Already onboarded: prevent going back to /onboarding
  if (onboardingCompleted && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api).*)",
  ],
};
