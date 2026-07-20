import type { ID } from "@/types/api";

/**
 * `POST /api/contracts/quick-create` — confirmed live with a FULL real saved
 * example response (rare for this session; most endpoints only have a
 * request example). Body is just `{ property_id }`: this creates AND
 * auto-accepts a binding contract at the property's listed price and
 * generates a payment link in one call — it is NOT a negotiable offer (no
 * amount field accepted). The richer `POST /api/contracts` (owner → client,
 * a different direction entirely) is what actually supports a negotiated
 * amount/terms — out of scope here. See docs/design-vs-backend-gaps.md,
 * Phase 11.
 */
export interface QuickCreateContractPayload {
  property_id: ID;
}

export interface ApiOfferProfile {
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
}

export interface ApiOfferParty {
  user_id: ID;
  email: string;
  phone_number: string;
  role: string;
  profile: ApiOfferProfile;
}

export interface ApiOfferProperty {
  property_id: ID;
  owner_id: ID;
  title: string;
  property_type: string;
  purpose: string;
  price: string;
  currency: string;
  location_address: string;
  city: string;
  state: string;
  status: string;
  verification_status: string;
}

export interface ApiOfferTransaction {
  transaction_id: ID;
  contract_id: ID;
  transaction_uuid: string;
  property_id: ID;
  buyer_id: ID;
  seller_id: ID;
  transaction_type: string;
  amount: string;
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

export interface ApiOfferContract {
  contract_id: ID;
  contract_uuid: string;
  property_id: ID;
  owner_id: ID;
  client_id: ID;
  contract_type: string;
  property_amount: string;
  total_amount: string;
  terms_conditions: string;
  payment_schedule: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  property: ApiOfferProperty;
  transaction: ApiOfferTransaction;
  owner: ApiOfferParty;
  client: ApiOfferParty;
}

export interface ApiFeeLine {
  percentage: number;
  amount: number;
  description: string;
}

export interface ApiFeeBreakdown {
  property_amount: string;
  platform_fee: ApiFeeLine;
  legal_fee: ApiFeeLine;
  total_fees: number;
  total_amount: number;
}

export interface QuickCreateResponse {
  success: boolean;
  message: string;
  data: {
    contract: ApiOfferContract;
    transaction: ApiOfferTransaction;
    /**
     * One-time — only returned by this creation call, NOT by
     * `GET /api/contracts/{id}` (unlike everything else here). If the user
     * navigates away and comes back without this cached, there is no
     * confirmed way to fetch the same link again short of the separate,
     * unconfirmed-shape `POST /api/contracts/{id}/payment/generate-link`.
     */
    payment_link: string;
    payment_details: {
      gateway: string;
      gateway_reference: string;
      expires_at: string;
      amount: string;
      currency: string;
    };
    fee_breakdown: ApiFeeBreakdown;
  };
}

/**
 * `GET /api/contracts/{id}` — confirmed shape, but from what looks like a
 * hand-written docs example (round IDs like `1`/`123`/`456`, `2024-01-06`
 * dates) rather than a live-captured one like `quick-create` above —
 * monetary fields are typed loosely (`number | string`) since the live
 * `quick-create` response serializes them as strings but this example shows
 * plain numbers. Field NAMES are trustworthy either way.
 */
export interface ApiContractPartySummary {
  user_id: ID;
  email: string;
  full_name: string;
  role: string;
}

export interface ApiContractPropertySummary {
  property_id: ID;
  title: string;
  description: string;
  price: number | string;
  currency: string;
  status: string;
}

export interface ApiContractFee {
  fee_id: ID;
  contract_id: ID;
  fee_type: string;
  fee_name: string;
  amount: number | string;
  percentage: number;
  calculated_amount: number | string;
  created_at: string;
}

export interface ApiContractStatusHistoryEntry {
  history_id: ID;
  contract_id: ID;
  old_status: string | null;
  new_status: string;
  changed_by_user_id: ID;
  notes: string | null;
  created_at: string;
  changed_by: { user_id: ID; email: string; full_name: string };
}

export interface ApiContractDetail {
  contract_id: ID;
  contract_uuid: string;
  property_id: ID;
  owner_id: ID;
  client_id: ID;
  contract_type: string;
  property_amount: number | string;
  total_amount: number | string;
  terms_conditions: string;
  payment_schedule: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  property: ApiContractPropertySummary;
  owner: ApiContractPartySummary;
  client: ApiContractPartySummary;
  fees: ApiContractFee[];
  status_history: ApiContractStatusHistoryEntry[];
  /** Null until the contract has been accepted and a transaction created (e.g. a `sent`, not-yet-accepted contract). */
  transaction: ApiOfferTransaction | null;
}

/**
 * Deliberately loose — this backend's own docs show two different shapes for
 * `fee_breakdown` depending on the endpoint (`quick-create`'s live example:
 * keyed `platform_fee`/`legal_fee` objects; this endpoint's docs example:
 * a `fees: [{type, ...}]` array). Assuming the first shape here crashed
 * every real contract-detail fetch — see `extractFee()` in models.ts, which
 * parses whichever shape is actually present rather than trusting one guess.
 */
export interface ApiContractFeeBreakdownLoose {
  property_amount: number | string;
  total_amount: number;
  platform_fee?: ApiFeeLine;
  legal_fee?: ApiFeeLine;
  fees?: { type: string; percentage: number; calculated_amount: number | string; description: string }[];
}

export interface ContractDetailResponse {
  success: boolean;
  message: string;
  data: {
    contract: ApiContractDetail;
    fee_breakdown: ApiContractFeeBreakdownLoose;
    related_data: {
      property: ApiContractPropertySummary;
      owner: ApiContractPartySummary;
      client: ApiContractPartySummary;
      transaction: ApiOfferTransaction | null;
      fees: ApiContractFee[];
    };
  };
}

/**
 * `GET /api/contracts?property_id=&role=client` — confirmed real query
 * params (`role: owner|client`, `status`, `property_id`, `per_page`, etc.),
 * confirmed real paginated shape via the "List User Contracts" example.
 * Used to detect "you already have an offer on this property" before
 * showing the create-offer CTA — `quick-create` has no duplicate check of
 * its own, so skipping this would let a second real contract be created.
 */
export interface ApiContractListItem {
  contract_id: ID;
  contract_uuid: string;
  property_id: ID;
  owner_id: ID;
  client_id: ID;
  contract_type: string;
  property_amount: number | string;
  total_amount: number | string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContractsListResponse {
  success: boolean;
  message: string;
  data: {
    contracts: {
      current_page: number;
      data: ApiContractListItem[];
      last_page: number;
      per_page: number;
      total: number;
    };
    summary: Record<string, number>;
    pagination: { current_page: number; last_page: number; per_page: number; total: number };
  };
}

/** `POST /api/contracts/{id}/cancel` — confirmed real request/response shape. */
export interface CancelContractPayload {
  reason: string;
}

export interface CancelContractResponse {
  success: boolean;
  message: string;
  data: {
    contract: { contract_id: ID; status: string; cancelled_at: string; cancellation_reason: string };
    cancellation_details: { reason: string; cancelled_at: string; cancelled_by: ID };
  };
}

/**
 * `POST /api/contracts/{id}/payment/generate-link` — real endpoint (used
 * when the original one-time `payment_link` from `quick-create` is gone,
 * e.g. the checkout tab was closed and the offer page itself was also
 * reloaded/reopened later). Zero saved example of any kind — not even a
 * real request body, just inline comments noting `contractId` is a path
 * param and `gateway` an optional query param. Typed as loosely as possible;
 * `toRegeneratedPaymentLink()` in models.ts only trusts a `payment_link`
 * string if one is actually present, rather than assuming this shape.
 */
export interface RegenerateLinkResponse {
  success?: boolean;
  message?: string;
  data?: {
    payment_link?: string;
    payment_details?: { gateway?: string; expires_at?: string };
  };
}
