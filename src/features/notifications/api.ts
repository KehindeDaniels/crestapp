import { apiClient } from "@/lib/api/client";
import type { NotificationsResponse } from "./types";

export const notificationsApi = {
  list: () => apiClient<NotificationsResponse>("/api/notifications"),
};
