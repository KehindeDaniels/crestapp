"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Circle, Loader2, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { useSessionStore } from "@/features/auth";
import { usePropertyDetail, MessageOwnerButton } from "@/features/properties";
import {
  useTransactionDetail,
  toTransactionDetailModel,
  toTransactionChecklist,
} from "@/features/transactions";

/**
 * The Figma design's exact 4-step named timeline and Platform Fee/Legal Fee
 * breakdown have no backing data in the confirmed `GET
 * /api/transactions/{id}` response — no per-step timestamps, no fee
 * fields. Shown here instead: a checklist built from real fields
 * (`payment_received_at`, per-document `status`, escrow `conditions_met`),
 * and only the amount/currency/payment gateway/dates that are actually
 * real. See docs/design-vs-backend-gaps.md, Phase 10.
 *
 * "Share as PDF" uses the browser's native print dialog (real,
 * zero-dependency — most browsers offer "Save as PDF" there) rather than a
 * client-side PDF-generation library. "Share as Image" would need a new
 * dependency (e.g. html2canvas) for something not asked for yet — left
 * disabled rather than half-built.
 */
export function TransactionDetailModal({
  transactionId,
  onOpenChange,
}: {
  transactionId: number | null;
  onOpenChange: (open: boolean) => void;
}) {
  const currentUserId = useSessionStore((s) => s.user?.user_id);
  const { data, isPending } = useTransactionDetail(transactionId);
  const [showReceipt, setShowReceipt] = useState(false);

  const propertyId = data?.transaction.property_id ?? null;
  const { data: property } = usePropertyDetail(propertyId ?? 0);

  if (!transactionId) return null;

  const model =
    data &&
    toTransactionDetailModel(
      data.transaction,
      data.related_data.buyer,
      data.related_data.seller,
      data.related_data.property,
      currentUserId,
    );
  const checklist =
    data && toTransactionChecklist(data.transaction, data.related_data.escrow, data.related_data.documents);

  return (
    <Dialog
      open={!!transactionId}
      onOpenChange={(open) => {
        if (!open) setShowReceipt(false);
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-2xl">
        {isPending && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {model && !showReceipt && (
          <>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="relative aspect-337/217 overflow-hidden rounded-xl bg-muted">
                  {property?.imageUrl && (
                    <Image src={property.imageUrl} alt="" fill className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{model.counterpartyName}</p>
                  <p className="text-xs text-muted-foreground">Counterparty</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{model.typeLabel}</p>
                  <p className="text-xl font-bold">{model.amountFormatted}</p>
                  {property && (
                    <p className="text-sm text-muted-foreground">
                      {property.bedrooms} bd • {property.bathrooms} ba • {property.squareMeters} sqm
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{property?.address}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">
                    Status: <span className="capitalize">{model.status.replace(/_/g, " ")}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  {checklist?.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      {item.done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className={item.done ? "" : "text-muted-foreground"}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 rounded-xl bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-medium">{model.transactionUuid.slice(0, 13)}…</span>
                  </div>
                  {model.paymentGateway && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-medium capitalize">{model.paymentGateway}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(model.initiatedAt)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button type="button" onClick={() => setShowReceipt(true)}>
                    View Receipt
                  </Button>
                  <MessageOwnerButton
                    ownerId={model.counterpartyId}
                    propertyId={model.propertyId}
                    ownerName={model.counterpartyName}
                    label="Message Owner"
                    variant="outline"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {model && showReceipt && (
          <div className="space-y-4 print:p-6">
            <DialogHeader>
              <DialogTitle>Transaction Receipt</DialogTitle>
            </DialogHeader>

            <div className="space-y-1 text-center">
              <p className="text-2xl font-bold">{model.amountFormatted}</p>
              <p className="text-sm font-medium text-success">Transaction {model.status}</p>
              <p className="text-xs text-muted-foreground">{formatDate(model.initiatedAt)}</p>
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property</span>
                <span className="font-medium">{model.propertyTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{model.typeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-medium">{model.transactionUuid}</span>
              </div>
              {model.paymentGateway && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">{model.paymentGateway}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 print:hidden">
              <Button type="button" onClick={() => window.print()}>
                <Printer className="size-4" />
                Share as PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled
                title="Not built — would need a new client-side image-export dependency"
              >
                Share as Image
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowReceipt(false)}>
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
