import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getToken } from "@/lib/auth/token";
import { authApi } from "./api";
import { useSessionStore } from "./store";
import type {
  ForgotPasswordInput,
  LoginInput,
  OtpInput,
  RegisterPayload,
  ResetPasswordInput,
} from "./schema";
import type { VerificationType } from "./types";

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => setSession(data.user, data.access_token),
  });
}

/** Register does NOT return a token — caller must redirect to /login after success. */
export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterPayload) => authApi.register(input),
  });
}

export function useLogout() {
  const clear = useSessionStore((s) => s.clear);
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => clear(), // clear locally even if the network call fails
  });
}

export function useSendVerification() {
  return useMutation({
    mutationFn: ({ type, identifier }: { type: VerificationType; identifier: string }) =>
      authApi.sendVerification(type, identifier),
  });
}

export function useVerifyCode() {
  return useMutation({
    mutationFn: ({
      type,
      identifier,
      otp,
    }: {
      type: VerificationType;
      identifier: string;
      otp: OtpInput;
    }) => authApi.verifyCode(type, identifier, otp),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.requestPasswordReset(input),
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authApi.confirmPasswordReset(input),
  });
}

/** Hydrates the session from the API using the cookie-stored token, if any. */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    enabled: Boolean(getToken()),
    retry: false,
  });
}
