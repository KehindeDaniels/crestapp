"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";

/**
 * Guest-only guard for the auth route group (login/register/password/verify).
 * Bounces an already-authenticated user to /home.
 *
 * This preserves the one behavior `proxy.ts` did that no client guard covered
 * (a logged-in user visiting /login → /home). The middleware was removed for
 * static export (see next.config.ts / docs/deployment.md); this is its
 * client-side replacement. Unlike the removed middleware's instant edge
 * redirect, this fires after hydration — a brief flash of the auth screen is
 * possible for an already-logged-in user, which is an accepted trade-off of
 * going fully static.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/home");
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return <>{children}</>;
}
