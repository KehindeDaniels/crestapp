import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import { profileApi } from "./api";
import { toProfileViewModel } from "./models";

/** Returns a `ProfileViewModel`, never the raw API shape — see models.ts. */
export function useProfile() {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.profile.detail,
    queryFn: async () => toProfileViewModel(await profileApi.get()),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
