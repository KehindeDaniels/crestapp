import { apiClient } from "@/lib/api/client";
import type {
  GetPreferencesResponse,
  MarkNotificationReadResponse,
  NotificationPreferences,
  NotificationsResponse,
  UpdatePreferencesResponse,
} from "./types";

export const notificationsApi = {
  list: () => apiClient<NotificationsResponse>("/api/notifications"),

  markAsRead: (notificationId: number) =>
    apiClient<MarkNotificationReadResponse>(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    }),

  getPreferences: () => apiClient<GetPreferencesResponse>("/api/notifications/preferences"),

  updatePreferences: (payload: NotificationPreferences) =>
    apiClient<UpdatePreferencesResponse>("/api/notifications/preferences", {
      method: "PUT",
      body: payload,
    }),
};
