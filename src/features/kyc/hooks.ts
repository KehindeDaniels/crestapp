import { useMutation } from "@tanstack/react-query";
import { kycApi } from "./api";
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
