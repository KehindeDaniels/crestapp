import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: KycSubmitPayload) => kycApi.submit(payload),
    // Proactively refreshes ["kyc","mine"] instead of waiting out its 60s
    // staleTime — mainly so Home's KycReminderCard reflects a real submission
    // promptly. Not what caused the processing-page bug (that was
    // `(onboarding)/kyc/(wizard)/layout.tsx` wrapping the processing page
    // itself, since fixed), but a stale reminder card for up to a minute
    // after a real submit was already a real, independent rough edge.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.mine });
    },
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
