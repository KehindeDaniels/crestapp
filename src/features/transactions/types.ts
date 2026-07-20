import type { ID } from "@/types/api";

/**
 * Real, confirmed field names/shapes throughout this file — `GET
 * /api/transactions` and `GET /api/transactions/{id}` both have full saved
 * example responses in the Postman collection (unlike most endpoints built
 * this session), used verbatim here. See docs/design-vs-backend-gaps.md,
 * Phase 10 for what the Figma design shows that ISN'T backed by these
 * shapes (the exact 4-step progress timeline, platform/legal fee lines).
 */
export interface TransactionListParams {
  type?: "rent" | "purchase" | "deposit" | "service_fee";
  status?:
    | "initiated"
    | "pending_payment"
    | "payment_received"
    | "in_escrow"
    | "completed"
    | "cancelled"
    | "disputed"
    | "refunded";
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}

export interface ApiTransactionPropertySummary {
  property_id: ID;
  title: string;
  property_type: string;
}

export interface ApiTransactionPartySummary {
  user_id: ID;
  first_name: string;
  last_name: string;
}

export interface ApiTransaction {
  transaction_id: ID;
  transaction_uuid: string;
  property_id: ID;
  buyer_id: ID;
  seller_id: ID;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  initiated_at: string;
  completed_at: string | null;
  property: ApiTransactionPropertySummary;
  buyer: ApiTransactionPartySummary;
  seller: ApiTransactionPartySummary;
}

export interface TransactionsSummary {
  total_transactions: number;
  total_amount: number;
  active_transactions: number;
  completed_transactions: number;
  cancelled_transactions: number;
}

export interface LaravelPaginator<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface TransactionsListResponse {
  success: boolean;
  message: string;
  data: {
    transactions: LaravelPaginator<ApiTransaction>;
    summary: TransactionsSummary;
    pagination: { current_page: number; last_page: number; per_page: number; total: number };
  };
}

export interface ApiTransactionDetail {
  transaction_id: ID;
  transaction_uuid: string;
  property_id: ID;
  buyer_id: ID;
  seller_id: ID;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_gateway: string | null;
  payment_reference: string | null;
  initiated_at: string;
  payment_received_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
}

export interface ApiTransactionPartyDetail extends ApiTransactionPartySummary {
  email: string;
  phone: string;
}

export interface ApiTransactionPropertyDetail extends ApiTransactionPropertySummary {
  description: string;
  status: string;
}

export interface ApiTransactionDocument {
  document_id: ID;
  document_type: string;
  title: string;
  status: string;
}

export interface ApiTransactionEscrow {
  escrow_account_id: ID;
  transaction_id: ID;
  amount_held: number;
  currency: string;
  status: string;
  conditions_met: boolean;
}

export interface TransactionDetailResponse {
  success: boolean;
  message: string;
  data: {
    transaction: ApiTransactionDetail;
    related_data: {
      property: ApiTransactionPropertyDetail;
      buyer: ApiTransactionPartyDetail;
      seller: ApiTransactionPartyDetail;
      escrow: ApiTransactionEscrow | null;
      payments: unknown[];
      documents: ApiTransactionDocument[];
    };
  };
}
