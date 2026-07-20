import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/api";
import type {
  SendMessagePayload,
  SendMessageResponse,
  ConversationsResponse,
  ConversationThreadResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
} from "./types";

export const messagingApi = {
  send: (payload: SendMessagePayload) =>
    apiClient<SendMessageResponse>("/api/communication/messages/send", {
      method: "POST",
      body: payload,
    }),

  conversations: () =>
    apiClient<ConversationsResponse>("/api/communication/messages/conversations"),

  conversation: (userId: ID) =>
    apiClient<ConversationThreadResponse>(
      `/api/communication/messages/conversation/${userId}`,
    ),

  markAsRead: (messageId: ID) =>
    apiClient<MarkAsReadResponse>(`/api/communication/messages/read/${messageId}`, {
      method: "PUT",
    }),

  unreadCount: () =>
    apiClient<UnreadCountResponse>("/api/communication/messages/unread-count"),
};
