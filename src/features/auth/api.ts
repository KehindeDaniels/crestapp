import { apiClient } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api";
import type {
  ForgotPasswordInput,
  LoginInput,
  OtpInput,
  RegisterPayload,
  ResetPasswordInput,
} from "./schema";
import type { AuthUser, LoginResponse, RegisterResponse, VerificationType } from "./types";

export const authApi = {
  login: (input: LoginInput) =>
    apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: input,
    }),

  register: (input: RegisterPayload) =>
    apiClient<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: input,
    }),

  logout: () => apiClient<void>("/api/auth/logout", { method: "POST" }),

  me: () => apiClient<AuthUser>("/api/user"),

  /**
   * `code` is real, confirmed via a saved Postman example — but only for
   * `type: "phone"` ("200 SMS - Code Returned": `{message, code}`); the
   * `type: "email"` example ("200 Email - No Code in Response") has no
   * `code` field at all. Both are because the OTP-sending service isn't
   * live yet — the backend returns the code directly so testing isn't
   * blocked on it. Handled generically here (optional field) rather than
   * hardcoding "only phone has this," in case that changes.
   */
  sendVerification: (type: VerificationType, identifier: string) =>
    apiClient<{ message: string; code?: string }>("/api/auth/verification/send", {
      method: "POST",
      body: { type, identifier },
    }),

  verifyCode: (type: VerificationType, identifier: string, otp: OtpInput) =>
    apiClient<{ message: string }>("/api/auth/verification/verify", {
      method: "POST",
      body: { type, identifier, code: Number(otp.code) },
    }),

  requestPasswordReset: (input: ForgotPasswordInput) =>
    apiClient<ApiEnvelope<never> | { message: string }>(
      "/api/auth/password/reset",
      { method: "POST", body: input },
    ),

  confirmPasswordReset: (input: ResetPasswordInput) =>
    apiClient<{ message: string }>("/api/auth/password/reset/confirm", {
      method: "POST",
      body: {
        email: input.email,
        code: Number(input.code),
        password: input.password,
        password_confirmation: input.password_confirmation,
      },
    }),
};
