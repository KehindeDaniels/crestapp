import { formatCurrency } from "@/lib/utils/format";
import type { ID } from "@/types/api";
import type {
  ApiContractFeeBreakdownLoose,
  ContractDetailResponse,
  ContractsListResponse,
  QuickCreateResponse,
} from "./types";

/** View model for the post-creation "Transaction Overview" screen — components never touch the raw response directly. */
export interface OfferModel {
  contractId: ID;
  transactionId: ID;
  propertyId: ID;
  propertyTitle: string;
  propertyAddress: string;
  ownerName: string;
  ownerId: ID;
  currency: string;
  propertyAmountFormatted: string;
  platformFeeFormatted: string;
  platformFeePercentage: number;
  legalFeeFormatted: string;
  legalFeePercentage: number;
  totalAmountFormatted: string;
  paymentLink: string;
  paymentGateway: string;
  paymentExpiresAt: string;
  contractStatus: string;
  transactionStatus: string;
}

export function toOfferModel(response: QuickCreateResponse["data"]): OfferModel {
  const { contract, payment_link, payment_details, fee_breakdown } = response;
  const currency = payment_details.currency;
  const ownerFullName = [contract.owner.profile.first_name, contract.owner.profile.last_name]
    .filter(Boolean)
    .join(" ");

  return {
    contractId: contract.contract_id,
    transactionId: contract.transaction.transaction_id,
    propertyId: contract.property.property_id,
    propertyTitle: contract.property.title,
    propertyAddress: [contract.property.location_address, contract.property.city, contract.property.state]
      .filter(Boolean)
      .join(", "),
    ownerName: ownerFullName || "Property owner",
    ownerId: contract.owner.user_id,
    currency,
    propertyAmountFormatted: formatCurrency(Number(fee_breakdown.property_amount), currency),
    platformFeeFormatted: formatCurrency(fee_breakdown.platform_fee.amount, currency),
    platformFeePercentage: fee_breakdown.platform_fee.percentage,
    legalFeeFormatted: formatCurrency(fee_breakdown.legal_fee.amount, currency),
    legalFeePercentage: fee_breakdown.legal_fee.percentage,
    totalAmountFormatted: formatCurrency(fee_breakdown.total_amount, currency),
    paymentLink: payment_link,
    paymentGateway: payment_details.gateway,
    paymentExpiresAt: payment_details.expires_at,
    contractStatus: contract.status,
    transactionStatus: contract.transaction.status,
  };
}

const UNPAID_TRANSACTION_STATUSES = new Set(["initiated", "pending_payment"]);
const TERMINAL_CONTRACT_STATUSES = new Set(["completed", "cancelled", "expired"]);

export interface ContractStatusStage {
  label: string;
  done: boolean;
  active: boolean;
}

/**
 * View model for `/offers/[contractId]`'s real, polled status view — built
 * from `GET /api/contracts/{id}` (confirmed shape). The 3 stages match the
 * Figma design's labels, but only 2 real signals actually exist to derive
 * them from (`transaction.status` and `contract.status`, whose enum has no
 * intermediate value between "in_progress" and "completed") — "Verification
 * in Progress" and "Finalizing Agreement" are honestly a single real
 * transition split across two labels, not two independently-confirmed
 * stages. Documented here rather than silently implied as precise.
 */
export interface ContractStatusModel {
  contractId: ID;
  transactionId: ID | null;
  propertyId: ID;
  propertyTitle: string;
  ownerId: ID;
  ownerName: string;
  currency: string;
  propertyAmountFormatted: string;
  platformFeeFormatted: string;
  platformFeePercentage: number;
  legalFeeFormatted: string;
  legalFeePercentage: number;
  totalAmountFormatted: string;
  ownerReceivesFormatted: string;
  contractStatus: string;
  transactionStatus: string | null;
  isPaid: boolean;
  isTerminal: boolean;
  stages: ContractStatusStage[];
}

/**
 * `fee_breakdown` has been observed in two different shapes across this
 * backend's own documentation: `quick-create`'s LIVE-captured example keys
 * fees as `platform_fee`/`legal_fee` objects, while `Get Contract Details`'s
 * (and the standalone `Get Contract Fee Breakdown`'s) example — which reads
 * like hand-written docs, not a live capture — uses a `fees: [{type, ...}]`
 * array instead. Assuming only the first shape here is exactly what made
 * every real contract detail fetch throw and fall through to "offer no
 * longer available", even for brand-new offers. Handles both now.
 */
function extractFee(
  feeBreakdown: ApiContractFeeBreakdownLoose,
  type: "platform" | "legal",
): { amount: number; percentage: number } {
  const keyed = type === "platform" ? feeBreakdown.platform_fee : feeBreakdown.legal_fee;
  if (keyed) {
    return { amount: keyed.amount, percentage: keyed.percentage };
  }
  const found = feeBreakdown.fees?.find((f) => f.type === type);
  if (found) {
    return { amount: Number(found.calculated_amount), percentage: found.percentage };
  }
  return { amount: 0, percentage: 0 };
}

export function toContractStatusModel(response: ContractDetailResponse["data"]): ContractStatusModel {
  const { contract, fee_breakdown } = response;
  const currency = contract.property.currency;
  const transactionStatus = contract.transaction?.status ?? null;
  const isPaid = transactionStatus != null && !UNPAID_TRANSACTION_STATUSES.has(transactionStatus);
  const contractCompleted = contract.status === "completed";
  const contractInProgress = contract.status === "in_progress";

  const platformFee = extractFee(fee_breakdown, "platform");
  const legalFee = extractFee(fee_breakdown, "legal");
  const propertyAmount = Number(fee_breakdown.property_amount);

  return {
    contractId: contract.contract_id,
    transactionId: contract.transaction?.transaction_id ?? null,
    propertyId: contract.property.property_id,
    propertyTitle: contract.property.title,
    ownerId: contract.owner.user_id,
    ownerName: contract.owner.full_name || "Property owner",
    currency,
    propertyAmountFormatted: formatCurrency(propertyAmount, currency),
    platformFeeFormatted: formatCurrency(platformFee.amount, currency),
    platformFeePercentage: platformFee.percentage,
    legalFeeFormatted: formatCurrency(legalFee.amount, currency),
    legalFeePercentage: legalFee.percentage,
    totalAmountFormatted: formatCurrency(propertyAmount + platformFee.amount + legalFee.amount, currency),
    ownerReceivesFormatted: formatCurrency(propertyAmount - platformFee.amount - legalFee.amount, currency),
    contractStatus: contract.status,
    transactionStatus,
    isPaid,
    isTerminal: TERMINAL_CONTRACT_STATUSES.has(contract.status),
    stages: [
      { label: "Payment in Escrow", done: isPaid, active: !isPaid },
      { label: "Verification in Progress", done: contractCompleted, active: contractInProgress },
      { label: "Finalizing Agreement", done: contractCompleted, active: false },
    ],
  };
}

/** View model for the Listing Detail "already offered" check — just enough to swap the CTA and link to the existing offer. */
export interface ExistingOfferSummary {
  contractId: ID;
  status: string;
}

export function toExistingOfferSummary(
  response: ContractsListResponse["data"],
): ExistingOfferSummary | null {
  const [latest] = response.contracts.data;
  if (!latest) return null;
  return { contractId: latest.contract_id, status: latest.status };
}

/**
 * The one-time payment link + which gateway it's for — kept deliberately
 * narrow (not the full `OfferModel`) so `useRegeneratePaymentLink` can
 * always write a complete, valid cache entry on its own, even when there's
 * no prior `OfferModel` to merge into (e.g. the original creation's cache is
 * long gone). Everything else `/offers/[contractId]` needs to render comes
 * from `ContractStatusModel` (always real, always re-fetchable) instead.
 */
export interface PaymentLinkInfo {
  paymentLink: string;
  paymentGateway: string;
  paymentExpiresAt: string;
}

export function toPaymentLinkInfo(offer: OfferModel): PaymentLinkInfo {
  return {
    paymentLink: offer.paymentLink,
    paymentGateway: offer.paymentGateway,
    paymentExpiresAt: offer.paymentExpiresAt,
  };
}
