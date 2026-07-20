import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/api";
import type {
  CancelContractResponse,
  ContractDetailResponse,
  ContractsListResponse,
  QuickCreateResponse,
  RegenerateLinkResponse,
} from "./types";

export const offersApi = {
  quickCreate: (propertyId: ID) =>
    apiClient<QuickCreateResponse>("/api/contracts/quick-create", {
      method: "POST",
      body: { property_id: propertyId },
    }),

  getContract: (contractId: ID) =>
    apiClient<ContractDetailResponse>(`/api/contracts/${contractId}`),

  listForProperty: (propertyId: ID) =>
    apiClient<ContractsListResponse>(
      `/api/contracts?property_id=${propertyId}&role=client&per_page=1`,
    ),

  cancel: (contractId: ID, reason: string) =>
    apiClient<CancelContractResponse>(`/api/contracts/${contractId}/cancel`, {
      method: "POST",
      body: { reason },
    }),

  regeneratePaymentLink: (contractId: ID) =>
    apiClient<RegenerateLinkResponse>(
      `/api/contracts/${contractId}/payment/generate-link?gateway=flutterwave`,
      { method: "POST" },
    ),
};
