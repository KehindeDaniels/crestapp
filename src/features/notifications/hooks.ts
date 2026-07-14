import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import { notificationsApi } from "./api";

/**
 * Home only needs a boolean "does the user have unread notifications" for
 * the bell's dot — not the full notification list/inbox UI (no such screen
 * exists yet). Derived by checking the first page for any `is_read === 0`
 * item.
 *
 * Caveat (see docs/design/home-page-data-plan.md §2c): this is exact only if
 * unread notifications sort to page 1 (the one real sample looked
 * newest-first, but that ordering isn't documented/guaranteed) or if total
 * volume stays within one page. Good enough for a boolean "show the dot,"
 * not a real global unread count.
 */
export function useHasUnreadNotifications() {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const response = await notificationsApi.list();
      return response.data.data.some((n) => n.is_read === 0);
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}
