"use client";

import { useEffect } from "react";
import { getToken } from "@/lib/auth/token";
import { useCurrentUser } from "./hooks";
import { useSessionStore } from "./store";

/**
 * Authoritative session hook. Hydrates the store from /api/user using the
 * cookie-stored token (if any) so a page refresh restores the session.
 * `apiClient` already clears the session on any 401, so a failed hydration
 * naturally resolves to "guest".
 */
export function useAuth() {
  const user = useSessionStore((s) => s.user);
  const status = useSessionStore((s) => s.status);
  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);
  const clear = useSessionStore((s) => s.clear);

  const hasToken = Boolean(getToken());
  const { data, error, isPending } = useCurrentUser();

  useEffect(() => {
    if (!hasToken) {
      setStatus("guest");
      return;
    }
    if (data) setUser(data);
    if (error) clear();
  }, [hasToken, data, error, setUser, setStatus, clear]);

  return {
    user,
    isAuthenticated: status === "authenticated",
    // `isPending` (query has no data/error yet) rather than `!isFetched &&
    // isFetching` — the latter has a real gap on the very first render,
    // before TanStack Query's internal effect has actually started the
    // fetch, where isFetching is momentarily false. AuthGuard's redirect
    // effect could win that race and fire before /api/user is even called,
    // sending an authenticated user to /login (which proxy.ts then bounces
    // to /home, since the real cookie is still present) — a false "not
    // logged in" redirect discovered via live testing on /kyc.
    isLoading: hasToken && isPending,
  };
}
