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
