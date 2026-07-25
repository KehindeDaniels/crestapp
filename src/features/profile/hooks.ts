import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import type { UserRole } from "@/config/constants";
import { profileApi } from "./api";
import { toFullProfileModel, toProfileViewModel } from "./models";
import type { ChangePasswordPayload, UpdateProfilePayload } from "./types";

/**
 * Shared base query — one real `GET /api/profile` fetch, cached under
 * `queryKeys.profile.detail`. `useProfile()` and `useFullProfile()` below
 * both read this same cache entry via `select`, rather than each running
 * their own `queryFn` against the same key with a different return shape —
 * that exact pattern (two hooks, one key, different shapes) corrupted the
 * Notifications cache earlier this session (Phase 9); not repeating it here.
 */
function useProfileSelect<T>(select: (r: Awaited<ReturnType<typeof profileApi.get>>) => T) {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.profile.detail,
    queryFn: () => profileApi.get(),
    enabled: Boolean(userId),
    staleTime: 60_000,
    select,
  });
}

/** Returns a `ProfileViewModel`, never the raw API shape — see models.ts. */
export function useProfile() {
  return useProfileSelect(toProfileViewModel);
}

/** Returns a `FullProfileModel` — used by the `/profile` page itself. */
export function useFullProfile() {
  return useProfileSelect(toFullProfileModel);
}

/**
 * `PUT /api/profile` — no confirmed response shape, so success is judged by
 * a non-throwing response, not by parsing `data`. Invalidates the shared
 * profile cache so both `useProfile()` (topbar) and `useFullProfile()`
 * (this page) reflect the change immediately.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail });
    },
  });
}

/** `POST /api/auth/password/change` — confirmed real endpoint. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileApi.changePassword(payload),
  });
}

/**
 * `PUT /api/profile/role` — self-service role switch. On success, updates the
 * session store's role (so gates like List Property's `canList` and the
 * role cookie's proxy redirects reflect it without a re-login) and refreshes
 * the profile cache. No confirmed response shape — the switched-to role we
 * trust is the one we sent, not one parsed from the response.
 */
export function useSwitchRole() {
  const queryClient = useQueryClient();
  const setRole = useSessionStore((s) => s.setRole);
  return useMutation({
    mutationFn: (role: UserRole) => profileApi.switchRole(role),
    onSuccess: (_data, role) => {
      setRole(role);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail });
    },
  });
}
