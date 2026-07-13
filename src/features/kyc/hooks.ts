import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import { kycApi, parseKycStatus } from "./api";
import type { KycSubmitPayload } from "./types";

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, purpose }: { file: File; purpose: string }) =>
      kycApi.uploadFile(file, purpose),
  });
}

export function useSubmitKyc() {
  return useMutation({
    mutationFn: (payload: KycSubmitPayload) => kycApi.submit(payload),
  });
}

/**
 * "My KYC status" — used to show/hide the reminder card until approved.
 * `retry: false` mirrors useCurrentUser() — don't hammer an endpoint whose
 * response shape (and even self-lookup authorization) is unconfirmed.
 */
export function useMyKycStatus() {
  const user = useSessionStore((s) => s.user);
  return useQuery({
    queryKey: queryKeys.kyc.mine,
    queryFn: async () => {
      const response = await kycApi.findSingle({
        requester_id: user!.user_id,
        user_id: user!.user_id,
      });
      return parseKycStatus(response);
    },
    enabled: Boolean(user?.user_id),
    staleTime: 60_000,
    retry: false,
  });
}
