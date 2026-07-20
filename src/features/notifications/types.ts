import type { Paginated } from "@/types/api";

/**
 * GET /api/notifications response. Confirmed live 2026-07-14 (see
 * docs/design/home-page-data-plan.md §2c) — a standard Laravel paginator,
 * distinct from properties/search's custom `{properties, pagination}` shape.
 */
export interface ApiNotification {
  notification_id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: 0 | 1;
  read_at: string | null;
  priority: "low" | "high" | string;
  channel: string;
  status: string;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Paginated<ApiNotification>;
}

/**
 * PUT /api/notifications/{id}/read — confirmed real endpoint, but no saved
 * example response (unlike `GET /api/notifications`). Typed defensively.
 */
export interface MarkNotificationReadResponse {
  success: boolean;
  message: string;
}

/**
 * `GET`/`PUT /api/notifications/preferences` — real endpoints, confirmed via
 * the `PUT` request body's 3 boolean fields (no saved example for either).
 * Simpler than the Figma design, which shows a 3-way Immediately/Daily/Off
 * per channel plus a separate "Chats Notification" toggle — none of that
 * granularity has a backing field here, just one on/off per channel. See
 * docs/design-vs-backend-gaps.md, Phase 12.
 */
export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export interface GetPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}

export interface UpdatePreferencesResponse {
  success: boolean;
  message: string;
}
