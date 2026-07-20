import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { transactionsApi } from "./api";
import { toTransactionModel } from "./models";
import type { ID } from "@/types/api";
import type { TransactionListParams } from "./types";

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params),
    queryFn: async () => {
      const response = await transactionsApi.list(params);
      return {
        transactions: response.data.transactions.data.map(toTransactionModel),
        pagination: {
          currentPage: response.data.transactions.current_page,
          lastPage: response.data.transactions.last_page,
        },
        summary: response.data.summary,
      };
    },
  });
}

export function useTransactionDetail(id: ID | null) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id ?? 0),
    queryFn: async () => {
      const response = await transactionsApi.get(id!);
      return response.data;
    },
    enabled: id != null,
  });
}
