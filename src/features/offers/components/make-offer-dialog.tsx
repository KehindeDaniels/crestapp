"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/format";
import { isApiError } from "@/lib/api/errors";
import type { ID } from "@/types/api";
import type { VariantProps } from "class-variance-authority";
import { useCreateOffer } from "../hooks";

/**
 * Real percentages confirmed via `POST /api/contracts/quick-create`'s own
 * `fee_breakdown` (and independently via `GET /api/contracts/{id}/fees`) —
 * 2.5% platform + 5% legal. The Figma screenshots for this screen show
 * "Platform Fee (5%)" and "Legal Fee (10%) — Free", which doesn't match
 * either confirmed source; this preview (and the real created contract) use
 * the confirmed real numbers instead. See docs/design-vs-backend-gaps.md,
 * Phase 11. This is only a PREVIEW — the actual fees are computed
 * server-side by `quick-create` and may not match exactly (e.g. rounding).
 */
const PLATFORM_FEE_RATE = 0.025;
const LEGAL_FEE_RATE = 0.05;

export function MakeOfferDialog({
  propertyId,
  propertyPrice,
  currency,
  propertyTitle,
  className,
  variant = "outline",
  size,
}: {
  propertyId: ID;
  propertyPrice: number;
  currency: string;
  propertyTitle: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const createOffer = useCreateOffer();

  const platformFee = propertyPrice * PLATFORM_FEE_RATE;
  const legalFee = propertyPrice * LEGAL_FEE_RATE;
  const total = propertyPrice + platformFee + legalFee;

  function handleConfirm() {
    createOffer.mutate(propertyId, {
      onSuccess: (response) => {
        setOpen(false);
        router.push(`/offers/view?id=${response.data.contract.contract_id}`);
      },
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        Make Offer
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your offer</DialogTitle>
            <DialogDescription>
              This creates a binding purchase agreement for {propertyTitle} at the listed price —
              you&apos;ll pay immediately after confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-xl bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property Price</span>
              <span className="font-medium">{formatCurrency(propertyPrice, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (2.5%)</span>
              <span className="font-medium">{formatCurrency(platformFee, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Legal Fee (5%)</span>
              <span className="font-medium">{formatCurrency(legalFee, currency)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Estimated Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            Your payment is held securely in escrow and only released to the owner once the
            agreement is finalized.
          </div>

          {createOffer.isError && (
            <div className="space-y-2 rounded-xl bg-destructive/8 p-3 text-sm">
              {isApiError(createOffer.error) && createOffer.error.code === "KYC_NOT_VERIFIED" ? (
                <>
                  <p className="font-medium text-destructive">Verify your identity to continue</p>
                  <p className="text-muted-foreground">
                    Crest requires KYC verification before you can make an offer — this keeps
                    transactions safe for both buyers and sellers.
                  </p>
                  <Link href="/kyc" className="inline-block font-medium text-primary underline">
                    Start KYC verification
                  </Link>
                </>
              ) : (
                <p className="text-destructive">
                  {isApiError(createOffer.error)
                    ? createOffer.error.message
                    : "Couldn't create this offer — try again."}
                </p>
              )}
            </div>
          )}

          <Button type="button" onClick={handleConfirm} disabled={createOffer.isPending} className="w-full">
            {createOffer.isPending ? "Creating offer…" : "Confirm & Continue"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
