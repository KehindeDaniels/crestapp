import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import { notificationsApi } from "./api";

/**
 * Home only needs "does the user have unread notifications" (bell dot) and
 * an approximate unread count (bell badge, per the real mobile Figma pull
 * showing a numeric badge) — not the full notification list/inbox UI (no
 * such screen exists yet). Derived from the first page's `is_read === 0`
 * items.
 *
 * Caveat (see docs/design/home-page-data-plan.md §2c): exact only if unread
 * notifications sort to page 1 (the one real sample looked newest-first,
 * but that ordering isn't documented/guaranteed) or if total volume stays
 * within one page. Good enough for a dot/badge, not a guaranteed-accurate
 * global count.
 */
export function useUnreadNotifications() {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const response = await notificationsApi.list();
      const unreadCount = response.data.data.filter((n) => n.is_read === 0).length;
      return { hasUnread: unreadCount > 0, count: unreadCount };
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}
