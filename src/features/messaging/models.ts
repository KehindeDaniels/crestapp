import type { ID } from "@/types/api";
import type { ApiConversation, ApiMessage } from "./types";

/** View model for one row in the conversation list. */
export interface ConversationModel {
  userId: ID;
  name: string;
  avatarUrl: string | null;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function toConversationModel(conversation: ApiConversation): ConversationModel {
  const { first_name, last_name, profile_picture_url } = conversation.other_user.profile;
  return {
    userId: conversation.other_user.user_id,
    name: `${first_name} ${last_name}`.trim() || "User",
    avatarUrl: profile_picture_url,
    lastMessagePreview: conversation.last_message.content,
    lastMessageAt: conversation.last_message_at,
    unreadCount: conversation.unread_count,
  };
}

/** View model for one message bubble in a thread. */
export interface MessageModel {
  id: ID;
  isMine: boolean;
  content: string;
  createdAt: string;
  isRead: boolean;
  /** Set when `reference_type === "property"` — the thread view fetches this property's own details separately to render the referenced-listing card. */
  referencedPropertyId: ID | null;
}

export function toMessageModel(message: ApiMessage, currentUserId: ID): MessageModel {
  return {
    id: message.message_id,
    isMine: message.sender_id === currentUserId,
    content: message.content,
    createdAt: message.sent_at,
    isRead: message.read_status,
    referencedPropertyId:
      message.reference_type?.toLowerCase() === "property" ? message.reference_id : null,
  };
}
