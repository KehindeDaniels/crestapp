import type { ID } from "@/types/api";

/**
 * POST /api/communication/messages/send request body. Confirmed via the
 * Postman collection's documented example — `reference_type: "property"` is
 * explicitly supported for "message the owner about this listing" flows.
 * No example response is documented. `reference_id`/`reference_type` are
 * optional here (not confirmed required by the backend either way) — only
 * set them when a message is genuinely about a specific property
 * (`MessageOwnerButton`); a plain reply within an existing conversation
 * thread has no property to reference, so sending a fabricated one (e.g.
 * the recipient's user id mislabeled as a property id) would be worse than
 * omitting the fields.
 */
export interface SendMessagePayload {
  recipient_id: ID;
  content: string;
  message_type: "text";
  attachments: [];
  reference_id?: ID;
  reference_type?: "property";
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
}

/**
 * Everything below (conversations list, thread, unread count, mark-as-read)
 * is confirmed to exist as real endpoints (Postman collection, "Messaging"
 * folder), but NONE of them have a saved example request/response — unlike
 * `Send Message` above. These shapes are a best-effort design based on: (a)
 * the field names `Send Message`'s own payload confirms are real
 * (`sender_id`/`recipient_id`/`content`/`message_type`/`attachments`/
 * `reference_id`/`reference_type`), and (b) how this same backend shapes a
 * user reference elsewhere (`ApiPropertyOwner` in properties/types.ts nests
 * `profile: {first_name, last_name, full_name, profile_picture_url}`).
 * Treat as unconfirmed until live-tested — see docs/design-vs-backend-gaps.md.
 */
export interface MessagingParticipant {
  user_id: ID;
  role: string;
  profile: {
    first_name: string;
    last_name: string;
    full_name: string;
    profile_picture_url: string | null;
  };
}

export interface ApiConversation {
  user: MessagingParticipant;
  last_message: {
    content: string;
    created_at: string;
    is_read: 0 | 1;
    sender_id: ID;
  };
  unread_count: number;
}

export interface ConversationsResponse {
  success: boolean;
  message: string;
  data: ApiConversation[];
}

export interface ApiMessage {
  message_id: ID;
  sender_id: ID;
  recipient_id: ID;
  content: string;
  message_type: string;
  attachments: string[];
  reference_id: ID | null;
  reference_type: string | null;
  is_read: 0 | 1;
  created_at: string;
}

export interface ConversationThreadResponse {
  success: boolean;
  message: string;
  data: {
    messages: ApiMessage[];
    participant?: MessagingParticipant;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: { unread_count: number };
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}
