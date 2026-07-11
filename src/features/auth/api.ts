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

  sendVerification: (type: VerificationType, identifier: string) =>
    apiClient<{ message: string }>("/api/auth/verification/send", {
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
