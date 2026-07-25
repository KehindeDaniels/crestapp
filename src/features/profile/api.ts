import { apiClient } from "@/lib/api/client";
import type { UserRole } from "@/config/constants";
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
  ProfileResponse,
  SwitchRoleResponse,
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

  switchRole: (role: UserRole) =>
    apiClient<SwitchRoleResponse>("/api/profile/role", { method: "PUT", body: { role } }),
};
