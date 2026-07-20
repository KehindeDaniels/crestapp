import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import { notificationsApi } from "./api";
import type { ApiNotification } from "./types";

/**
 * Shared base query — one real fetch, one cache entry
 * (`queryKeys.notifications.all`), always caching the raw list. Both
 * `useUnreadNotifications` and `useNotificationsList` read this same entry
 * via `select`, each with their own transform. Deliberately NOT two
 * separate `useQuery` calls on the same key with different `queryFn`
 * return shapes — that would race: whichever one last wrote the cache
 * would silently corrupt the other's expected shape (e.g. Topbar's bell
 * suddenly getting a raw array instead of `{hasUnread, count}` and
 * crashing). Caught in self-review before shipping, not a live bug.
 */
function useNotificationsQuery<T>(select: (data: ApiNotification[]) => T) {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const response = await notificationsApi.list();
      return response.data.data;
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
    select,
  });
}

/**
 * Home/Topbar only need "does the user have unread notifications" (bell
 * dot) and an approximate unread count (bell badge, per the real mobile
 * Figma pull showing a numeric badge).
 *
 * Caveat (see docs/design/home-page-data-plan.md §2c): exact only if unread
 * notifications sort to page 1 (the one real sample looked newest-first,
 * but that ordering isn't documented/guaranteed) or if total volume stays
 * within one page. Good enough for a dot/badge, not a guaranteed-accurate
 * global count.
 */
export function useUnreadNotifications() {
  return useNotificationsQuery((notifications) => {
    const unreadCount = notifications.filter((n) => n.is_read === 0).length;
    return { hasUnread: unreadCount > 0, count: unreadCount };
  });
}

/** Full list for the bell dropdown (real Figma pull, node 1551-7332). */
export function useNotificationsList() {
  return useNotificationsQuery((notifications) => notifications);
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
