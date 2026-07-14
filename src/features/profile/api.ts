import { apiClient } from "@/lib/api/client";
import type { ProfileResponse } from "./types";

export const profileApi = {
  get: () => apiClient<ProfileResponse>("/api/profile"),
};
