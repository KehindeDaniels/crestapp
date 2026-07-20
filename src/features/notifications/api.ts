import { apiClient } from "@/lib/api/client";
import type { NotificationsResponse, MarkNotificationReadResponse } from "./types";

export const notificationsApi = {
  list: () => apiClient<NotificationsResponse>("/api/notifications"),

  markAsRead: (notificationId: number) =>
    apiClient<MarkNotificationReadResponse>(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    }),
};
