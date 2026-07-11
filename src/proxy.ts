import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/config/constants";

/**
 * Optimistic auth redirects (Next 16 renamed `middleware` → `proxy`, Node runtime).
 *
 * This is a UX convenience only — it does a cheap cookie-existence check, never a
 * network call (per Next 16 guidance). Real enforcement lives in the Laravel API
 * plus client-side guards (AuthGuard / RoleGate / KycGuard).
 */
const GUEST_ONLY = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/kyc",
  "/properties/new",
  "/properties/mine",
  "/contracts",
  "/messages",
  "/support",
  "/notifications",
  "/profile",
  "/admin",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !hasToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isGuestOnly && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
