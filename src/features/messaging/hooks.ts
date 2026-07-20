import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import type { ID } from "@/types/api";
import { messagingApi } from "./api";
import { toConversationModel, toMessageModel } from "./models";
import type { SendMessagePayload } from "./types";

/** No inbox/thread UI exists yet to view the conversation afterward — the send itself is real, per explicit decision (docs/design-vs-backend-gaps.md). */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => messagingApi.send(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations });
    },
  });
}

/**
 * No backend broadcasting/websocket infrastructure exists (checked the whole
 * Postman collection) — polling via `refetchInterval` is how this app
 * already fakes "feels live" elsewhere (notifications), not a new pattern.
 */
const POLL_CONVERSATIONS_MS = 15_000;
const POLL_THREAD_MS = 5_000;

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.messaging.conversations,
    queryFn: async () => {
      const response = await messagingApi.conversations();
      return response.data.map(toConversationModel);
    },
    refetchInterval: POLL_CONVERSATIONS_MS,
  });
}

export function useConversationThread(userId: ID | null) {
  const currentUserId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.messaging.conversation(userId ?? 0),
    queryFn: async () => {
      const response = await messagingApi.conversation(userId!);
      return response.data.messages.map((m) => toMessageModel(m, currentUserId!));
    },
    enabled: userId != null && currentUserId != null,
    refetchInterval: POLL_THREAD_MS,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: ID) => messagingApi.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.unreadCount });
    },
  });
}

export function useUnreadMessageCount() {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.messaging.unreadCount,
    queryFn: async () => {
      const response = await messagingApi.unreadCount();
      return response.data.unread_count;
    },
    enabled: Boolean(userId),
    refetchInterval: POLL_CONVERSATIONS_MS,
  });
}
