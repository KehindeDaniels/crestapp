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
    // Keep the auth guard waiting while the session is still uninitialized
    // and a token exists. This avoids a false redirect when the user is
    // already authenticated and the cached /api/user result has not yet been
    // reflected in the local session store.
    isLoading: hasToken && (status === "idle" || isPending),
  };
}
