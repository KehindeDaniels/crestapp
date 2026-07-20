import { formatCurrency } from "@/lib/utils/format";
import type { ID } from "@/types/api";
import type { QuickCreateResponse } from "./types";

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
