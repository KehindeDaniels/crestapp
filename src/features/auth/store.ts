import { create } from "zustand";
import { clearSession, persistRole, persistSession } from "@/lib/auth/token";
import type { UserRole } from "@/config/constants";
import type { AuthUser } from "./types";

interface SessionState {
  user: AuthUser | null;
  /** Undetermined until the initial /api/user hydration finishes. */
  status: "idle" | "loading" | "authenticated" | "guest";
  setSession: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  /** Self-service role switch — updates the store's user + the role cookie so gates and proxy redirects reflect it immediately. */
  setRole: (role: UserRole) => void;
  setStatus: (status: SessionState["status"]) => void;
  clear: () => void;
}

/**
 * Global client-side session snapshot. The bearer token itself lives in the
 * cookie (see lib/auth/token.ts) — this store mirrors the user object for
 * synchronous access from guards/UI without re-reading cookies everywhere.
 */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: "idle",
  setSession: (user, token) => {
    persistSession({ token, role: user.role, status: user.status });
    set({ user, status: "authenticated" });
  },
  setUser: (user) => set({ user, status: "authenticated" }),
  setRole: (role) =>
    set((state) => {
      persistRole(role);
      return state.user ? { user: { ...state.user, role } } : {};
    }),
  setStatus: (status) => set({ status }),
  clear: () => {
    clearSession();
    set({ user: null, status: "guest" });
  },
}));
