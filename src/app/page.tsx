import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "@/config/constants";

/**
 * The app has no landing page of its own — the public site at crestapp.ng
 * (WordPress) is the marketing front door. The app root redirects to Home
 * (signed in) or Login (guest).
 *
 * This redirect is done HERE at the page level (not only in proxy.ts
 * middleware) on purpose: on some hosts the middleware doesn't run, and a
 * previously-static landing page can get cached by a CDN and keep showing.
 * `force-dynamic` opts this route out of static generation/CDN caching so the
 * redirect always runs per request.
 */
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const hasToken = Boolean((await cookies()).get(AUTH_COOKIE)?.value);
  redirect(hasToken ? "/home" : "/login");
}
