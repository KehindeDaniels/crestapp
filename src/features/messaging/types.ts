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
 * Confirmed live via a real captured response from
 * `GET /api/communication/messages/conversations` (2026-07-20) — this
 * replaced an earlier guessed shape (`user`/`last_message.created_at`/
 * `last_message.is_read`) that didn't match reality and was throwing at
 * runtime. `ConversationThreadResponse`'s per-message shape is still
 * unconfirmed on its own, but reuses `ApiMessage` since a thread message and
 * a conversation's embedded `last_message` are the same underlying model.
 */
export interface MessagingProfile {
  profile_id: ID;
  user_id: ID;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessagingParticipant {
  user_id: ID;
  email: string;
  phone_number: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  profile: MessagingProfile;
}

export interface ApiMessage {
  message_id: ID;
  conversation_id: string;
  sender_id: ID;
  receiver_id: ID;
  sender?: MessagingParticipant;
  receiver?: MessagingParticipant;
  message_type: string;
  content: string;
  attachments: string[];
  read_status: boolean;
  read_at: string | null;
  delivered_status: boolean;
  delivered_at: string | null;
  sent_at: string;
  edited_at: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  reference_id: ID | null;
  reference_type: string | null;
}

export interface ApiConversationProperty {
  property_id: ID;
  title: string;
  property_type: string;
  purpose: string;
  price: string;
  currency: string;
  location_address: string;
  city: string;
  state: string;
}

export interface ApiConversation {
  conversation_id: string;
  other_user: MessagingParticipant;
  last_message: ApiMessage;
  last_message_at: string;
  unread_count: number;
  is_archived: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  property: ApiConversationProperty | null;
  transaction: unknown | null;
}

export interface ConversationsResponse {
  success: boolean;
  data: ApiConversation[];
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
