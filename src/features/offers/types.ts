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
