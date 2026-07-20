import { formatCurrency } from "@/lib/utils/format";
import type { ID } from "@/types/api";
import type { ApiTransaction, ApiTransactionDetail, ApiTransactionEscrow, ApiTransactionDocument } from "./types";

const TYPE_LABELS: Record<string, string> = {
  purchase: "Buy",
  rent: "Rent",
  deposit: "Deposit",
  service_fee: "Service Fee",
};

/**
 * The design's 3 tabs (All/Completed/In-Progress/Cancelled) don't map 1:1
 * onto the real 8-value status enum (`initiated|pending_payment|
 * payment_received|in_escrow|completed|cancelled|disputed|refunded`) — an
 * inferred bucketing, not a confirmed backend grouping. `disputed`/
 * `refunded` fall under "In Progress" since neither has its own tab in the
 * design; the real raw `status` is always shown too, not hidden.
 */
export type TransactionBucket = "completed" | "cancelled" | "in_progress";

export function bucketForStatus(status: string): TransactionBucket {
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "in_progress";
}

export interface TransactionModel {
  id: ID;
  propertyTitle: string;
  typeLabel: string;
  amountFormatted: string;
  status: string;
  bucket: TransactionBucket;
  date: string;
}

export function toTransactionModel(transaction: ApiTransaction): TransactionModel {
  return {
    id: transaction.transaction_id,
    propertyTitle: transaction.property.title,
    typeLabel: TYPE_LABELS[transaction.transaction_type] ?? transaction.transaction_type,
    amountFormatted: formatCurrency(transaction.amount, transaction.currency),
    status: transaction.status,
    bucket: bucketForStatus(transaction.status),
    date: transaction.initiated_at,
  };
}

/**
 * The Figma detail modal's 4-named-step timeline ("Payment Completed" ->
 * "Legal Review in Progress" -> "Verification in Progress" -> "Finalizing
 * Agreement") has no backing data anywhere in the confirmed
 * `GET /api/transactions/{id}` response — no per-step timestamps or named
 * stages exist. Built instead from what IS real: `payment_received_at`,
 * each linked document's own `status`, and the escrow's `conditions_met`
 * boolean. Fewer, honestly-labeled checklist items rather than fabricated
 * precision.
 */
export interface TransactionChecklistItem {
  label: string;
  done: boolean;
}

export function toTransactionChecklist(
  transaction: ApiTransactionDetail,
  escrow: ApiTransactionEscrow | null,
  documents: ApiTransactionDocument[],
): TransactionChecklistItem[] {
  const items: TransactionChecklistItem[] = [
    { label: "Payment received", done: Boolean(transaction.payment_received_at) },
  ];
  if (documents.length > 0) {
    const approved = documents.filter((d) => d.status === "approved").length;
    items.push({
      label: `Documents reviewed (${approved}/${documents.length})`,
      done: approved === documents.length,
    });
  }
  if (escrow) {
    items.push({ label: "Escrow conditions met", done: escrow.conditions_met });
  }
  items.push({ label: "Transaction completed", done: transaction.status === "completed" });
  return items;
}

export interface TransactionDetailModel {
  id: ID;
  transactionUuid: string;
  propertyId: ID;
  propertyTitle: string;
  propertyType: string;
  typeLabel: string;
  amountFormatted: string;
  currency: string;
  status: string;
  bucket: TransactionBucket;
  paymentGateway: string | null;
  initiatedAt: string;
  completedAt: string | null;
  counterpartyId: ID;
  counterpartyName: string;
}

export function toTransactionDetailModel(
  transaction: ApiTransactionDetail,
  buyer: { user_id: ID; first_name: string; last_name: string },
  seller: { user_id: ID; first_name: string; last_name: string },
  property: { title: string; property_type: string },
  currentUserId: ID | undefined,
): TransactionDetailModel {
  const isBuyer = currentUserId === buyer.user_id;
  const counterparty = isBuyer ? seller : buyer;

  return {
    id: transaction.transaction_id,
    transactionUuid: transaction.transaction_uuid,
    propertyId: transaction.property_id,
    propertyTitle: property.title,
    propertyType: property.property_type,
    typeLabel: TYPE_LABELS[transaction.transaction_type] ?? transaction.transaction_type,
    amountFormatted: formatCurrency(transaction.amount, transaction.currency),
    currency: transaction.currency,
    status: transaction.status,
    bucket: bucketForStatus(transaction.status),
    paymentGateway: transaction.payment_gateway,
    initiatedAt: transaction.initiated_at,
    completedAt: transaction.completed_at,
    counterpartyId: counterparty.user_id,
    counterpartyName: `${counterparty.first_name} ${counterparty.last_name}`.trim(),
  };
}
