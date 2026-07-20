import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/api";
import type { TransactionListParams, TransactionsListResponse, TransactionDetailResponse } from "./types";

export const transactionsApi = {
  list: (params: TransactionListParams) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) query.set(key, String(value));
    }
    const qs = query.toString();
    return apiClient<TransactionsListResponse>(`/api/transactions${qs ? `?${qs}` : ""}`);
  },

  get: (id: ID) => apiClient<TransactionDetailResponse>(`/api/transactions/${id}`),
};
