import type { ID } from "@/types/api";

/**
 * POST /api/communication/messages/send request body. Confirmed via the
 * Postman collection's documented example — `reference_type: "property"` is
 * explicitly supported for "message the owner about this listing" flows.
 * No example response is documented.
 */
export interface SendMessagePayload {
  recipient_id: ID;
  content: string;
  message_type: "text";
  attachments: [];
  reference_id: ID;
  reference_type: "property";
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
}
