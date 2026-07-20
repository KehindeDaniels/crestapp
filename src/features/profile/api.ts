import { apiClient } from "@/lib/api/client";
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
  ProfileResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "./types";

export const profileApi = {
  get: () => apiClient<ProfileResponse>("/api/profile"),

  update: (payload: UpdateProfilePayload) =>
    apiClient<UpdateProfileResponse>("/api/profile", { method: "PUT", body: payload }),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient<ChangePasswordResponse>("/api/auth/password/change", {
      method: "POST",
      body: payload,
    }),
};
